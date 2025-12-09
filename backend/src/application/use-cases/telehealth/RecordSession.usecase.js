/**
 * Use Case: Record Session
 * Registrar URL de grabación de sesión
 */

class RecordSessionUseCase {
  constructor({ appointmentRepository, fileService }) {
    this.appointmentRepository = appointmentRepository;
    this.fileService = fileService;
  }

  async execute({ appointmentId, recordingFile, recordingFileName, recordingMimeType, userId }) {
    // Buscar la cita
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Verificar que el usuario es parte de la cita
    if (appointment.studentId !== userId && appointment.teacherId !== userId) {
      throw new Error('You do not have permission to record this appointment');
    }

    // Subir archivo de grabación a Azure Blob Storage
    const recordingUrl = await this.fileService.uploadFile(
      recordingFile,
      recordingFileName,
      recordingMimeType,
      {
        container: 'telehealth-recordings',
        folder: `appointments/${appointmentId}`,
      }
    );

    // Actualizar cita con URL de grabación
    appointment.addRecording(recordingUrl);

    const updatedAppointment = await this.appointmentRepository.update(appointmentId, {
      recordingUrl: appointment.recordingUrl,
      updatedAt: appointment.updatedAt,
    });

    return {
      appointmentId,
      recordingUrl: updatedAppointment.recordingUrl,
      message: 'Session recording uploaded successfully',
    };
  }
}

module.exports = RecordSessionUseCase;
