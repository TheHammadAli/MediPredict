const Prescription = require("../Model/Prescription");
const Patient = require("../Model/Patient");
const Doctor = require("../Model/Doctor");
const DocProfile = require("../Model/DocProfile");
const Pharmacist = require("../Model/Pharmacist");
const PrescriptionService = require("../Services/PrescriptionService");
const AuditService = require("../Services/AuditService");
const {
  PrescriptionNotFoundError,
  UnauthorizedPrescriptionAccessError,
  PrescriptionAlreadyDispensedError,
  PatientNotFoundError,
  MedicineAlreadyDispensedError
} = require("../Middleware/prescriptionErrorHandler");

// Create a new prescription
const createPrescription = async (req, res, next) => {
  try {
    const { patient, medicines, additionalNotes, labTests, followUpInstructions } = req.body;
    const doctorId = req.user.id;

    // Verify patient exists
    const patientRecord = await Patient.findById(patient.id);
    if (!patientRecord) {
      throw new PatientNotFoundError(patient.id);
    }

    // Get doctor profile information
    const doctorProfile = await DocProfile.findOne({ doctorRefId: doctorId });
    const doctorRecord = await Doctor.findById(doctorId);

    // Generate unique prescription number
    const prescriptionNumber = await PrescriptionService.generatePrescriptionNumber();

    // Create prescription data
    const prescriptionData = {
      prescriptionNumber,
      doctor: {
        id: doctorId,
        name: doctorProfile?.name || doctorRecord.username,
        specialization: doctorProfile?.speciality || doctorRecord.specialization,
        licenseNumber: doctorRecord.licenseNumber || 'N/A',
        contact: {
          phone: doctorProfile?.phone || '',
          email: doctorRecord.email
        }
      },
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        patientId: patientRecord.patientId || patient.id,
        appointmentRef: patient.appointmentRef || null
      },
      medicines: medicines.map(medicine => ({
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions?.trim() || '',
        dispensed: false
      })),
      additionalNotes: additionalNotes?.trim() || '',
      labTests: labTests || [],
      followUpInstructions: followUpInstructions?.trim() || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate prescription data
    const validationResult = PrescriptionService.validatePrescriptionData(prescriptionData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prescription validation failed',
          details: validationResult.errors
        }
      });
    }

    // Create prescription
    const prescription = await Prescription.create(prescriptionData);

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: prescription._id,
      action: 'created',
      performedBy: {
        userId: doctorId,
        userType: 'doctor',
        userName: doctorRecord.username
      },
      changes: { created: prescriptionData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get prescriptions based on user role
const getPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const userId = req.user.id;
    const userType = req.userType;

    let query = { isDeleted: false };
    let populateOptions = [];

    // Build query based on user role
    switch (userType) {
      case 'doctor':
        query['doctor.id'] = userId;
        populateOptions = [{ path: 'patient.id', select: 'username email' }];
        break;
      case 'patient':
        query['patient.id'] = userId;
        populateOptions = [{ path: 'doctor.id', select: 'username email specialization' }];
        break;
      case 'pharmacist':
        // Pharmacists can see all prescriptions for verification
        break;
      default:
        throw new UnauthorizedPrescriptionAccessError();
    }

    // Add status filter if provided
    if (status && ['active', 'completed', 'dispensed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: populateOptions
    };

    const prescriptions = await Prescription.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Prescription.countDocuments(query);

    // Create audit log for viewing prescriptions
    await AuditService.createAuditLog({
      prescriptionId: null,
      action: 'viewed',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: { query, count: prescriptions.length },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: prescriptions,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalItems: total,
        itemsPerPage: options.limit
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get a specific prescription by ID
const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.userType;

    const prescription = await Prescription.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!prescription) {
      throw new PrescriptionNotFoundError(id);
    }

    // Check authorization based on user role
    const hasAccess = PrescriptionService.checkUserAccess(prescription, userId, userType);
    if (!hasAccess) {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: id,
      action: 'viewed',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: { prescriptionId: id },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: prescription
    });

  } catch (error) {
    next(error);
  }
};

// Update a prescription
const updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicines, additionalNotes, labTests, followUpInstructions, status } = req.body;
    const userId = req.user.id;
    const userType = req.userType;

    const prescription = await Prescription.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!prescription) {
      throw new PrescriptionNotFoundError(id);
    }

    // Only doctors can update their own prescriptions
    if (userType !== 'doctor' || prescription.doctor.id.toString() !== userId) {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    // Check if prescription is already dispensed
    if (prescription.status === 'dispensed') {
      throw new PrescriptionAlreadyDispensedError(id);
    }

    // Store original data for audit
    const originalData = prescription.toObject();

    // Update fields
    const updates = {};
    if (medicines) {
      updates.medicines = medicines.map(medicine => ({
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions?.trim() || '',
        dispensed: medicine.dispensed || false,
        dispensedAt: medicine.dispensedAt || null,
        dispensedBy: medicine.dispensedBy || null
      }));
    }
    if (additionalNotes !== undefined) updates.additionalNotes = additionalNotes.trim();
    if (labTests) updates.labTests = labTests;
    if (followUpInstructions !== undefined) updates.followUpInstructions = followUpInstructions.trim();
    if (status) updates.status = status;
    updates.updatedAt = new Date();
    updates.version = prescription.version + 1;

    // Validate updated data
    const updatedData = { ...prescription.toObject(), ...updates };
    const validationResult = PrescriptionService.validatePrescriptionData(updatedData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prescription validation failed',
          details: validationResult.errors
        }
      });
    }

    // Update prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: id,
      action: 'updated',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: {
        before: originalData,
        after: updatedPrescription.toObject(),
        updates: updates
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: updatedPrescription,
      message: 'Prescription updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Soft delete a prescription
const deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.userType;

    const prescription = await Prescription.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!prescription) {
      throw new PrescriptionNotFoundError(id);
    }

    // Only doctors can delete their own prescriptions
    if (userType !== 'doctor' || prescription.doctor.id.toString() !== userId) {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    // Check if prescription is already dispensed
    if (prescription.status === 'dispensed') {
      throw new PrescriptionAlreadyDispensedError(id);
    }

    // Soft delete
    const deletedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        status: 'cancelled'
      },
      { new: true }
    );

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: id,
      action: 'deleted',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: { deleted: true, deletedAt: new Date() },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: deletedPrescription,
      message: 'Prescription deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Verify prescription (for pharmacists)
const verifyPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prescriptionNumber } = req.body;
    const userId = req.user.id;
    const userType = req.userType;

    // Only pharmacists can verify prescriptions
    if (userType !== 'pharmacist') {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    let query = { isDeleted: false };
    
    // Search by ID or prescription number
    if (id && id !== 'verify') {
      query._id = id;
    } else if (prescriptionNumber) {
      query.prescriptionNumber = prescriptionNumber;
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_IDENTIFIER',
          message: 'Prescription ID or prescription number is required'
        }
      });
    }

    const prescription = await Prescription.findOne(query);

    if (!prescription) {
      throw new PrescriptionNotFoundError(id || prescriptionNumber);
    }

    // Update verification status
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescription._id,
      {
        verifiedBy: userId,
        verifiedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: prescription._id,
      action: 'verified',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: { 
        verifiedBy: userId, 
        verifiedAt: new Date(),
        prescriptionNumber: prescription.prescriptionNumber
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: updatedPrescription,
      message: 'Prescription verified successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Mark medicine as dispensed (for pharmacists)
const dispenseMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { medicineIndex, pharmacistNotes } = req.body;
    const userId = req.user.id;
    const userType = req.userType;

    // Only pharmacists can dispense medicines
    if (userType !== 'pharmacist') {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    const prescription = await Prescription.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!prescription) {
      throw new PrescriptionNotFoundError(id);
    }

    // Check if medicine index is valid
    if (medicineIndex >= prescription.medicines.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MEDICINE_INDEX',
          message: 'Invalid medicine index'
        }
      });
    }

    // Check if medicine is already dispensed
    if (prescription.medicines[medicineIndex].dispensed) {
      throw new MedicineAlreadyDispensedError(id, medicineIndex);
    }

    // Mark medicine as dispensed
    prescription.medicines[medicineIndex].dispensed = true;
    prescription.medicines[medicineIndex].dispensedAt = new Date();
    prescription.medicines[medicineIndex].dispensedBy = userId;
    if (pharmacistNotes) {
      prescription.medicines[medicineIndex].pharmacistNotes = pharmacistNotes.trim();
    }

    // Check if all medicines are dispensed
    const allDispensed = prescription.medicines.every(medicine => medicine.dispensed);
    if (allDispensed) {
      prescription.status = 'dispensed';
    }

    prescription.updatedAt = new Date();
    await prescription.save();

    // Create audit log
    await AuditService.createAuditLog({
      prescriptionId: id,
      action: 'dispensed',
      performedBy: {
        userId: userId,
        userType: userType,
        userName: req.user.username
      },
      changes: {
        medicineIndex,
        medicineName: prescription.medicines[medicineIndex].name,
        dispensedAt: new Date(),
        pharmacistNotes,
        allDispensed
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: prescription,
      message: `Medicine dispensed successfully${allDispensed ? '. All medicines have been dispensed.' : ''}`
    });

  } catch (error) {
    next(error);
  }
};

// Get audit trail for a prescription
const getPrescriptionAudit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.userType;

    const prescription = await Prescription.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!prescription) {
      throw new PrescriptionNotFoundError(id);
    }

    // Check authorization
    const hasAccess = PrescriptionService.checkUserAccess(prescription, userId, userType);
    if (!hasAccess && userType !== 'pharmacist') {
      throw new UnauthorizedPrescriptionAccessError(id);
    }

    // Get audit logs
    const auditLogs = await AuditService.getAuditLogs(id);

    res.status(200).json({
      success: true,
      data: auditLogs
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  verifyPrescription,
  dispenseMedicine,
  getPrescriptionAudit
};