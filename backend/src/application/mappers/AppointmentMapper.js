/**
 * Appointment Mapper
 * Convierte entre Entity y DTOs
 */

const AppointmentResponseDto = require('../dtos/telehealth/AppointmentResponseDto');

class AppointmentMapper {
  /**
   * Convertir Entity a DTO completo
   */
  static toFullDto(appointment, includeUsers = false) {
    return new AppointmentResponseDto(appointment, includeUsers);
  }

  /**
   * Convertir Entity a DTO resumido
   */
  static toSummaryDto(appointment) {
    return AppointmentResponseDto.toSummary(appointment);
  }

  /**
   * Convertir lista de Entities a DTOs
   */
  static toDtoList(appointments, includeUsers = false) {
    return AppointmentResponseDto.toList(appointments, includeUsers);
  }

  /**
   * Convertir lista a DTOs resumidos
   */
  static toSummaryDtoList(appointments) {
    return appointments.map((apt) => AppointmentResponseDto.toSummary(apt));
  }
}

module.exports = AppointmentMapper;
