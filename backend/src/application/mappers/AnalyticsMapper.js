/**
 * Analytics Mapper
 * Transforma datos de analytics entre capas
 */

class AnalyticsMapper {
  /**
   * Mapea datos de dashboard a respuesta
   */
  static toDashboardResponse(dashboardData) {
    return {
      success: true,
      data: dashboardData,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea datos comparativos a respuesta
   */
  static toComparativeResponse(comparativeData) {
    return {
      success: true,
      data: comparativeData,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea información de reporte a respuesta
   */
  static toReportResponse(reportInfo) {
    return {
      success: true,
      report: {
        fileName: reportInfo.report.fileName,
        fileSize: reportInfo.report.fileSize,
        format: reportInfo.report.format,
        generatedAt: reportInfo.report.generatedAt,
        expiresAt: reportInfo.report.expiresAt,
        downloadUrl: `/api/analytics/reports/${reportInfo.report.fileName}/download`,
      },
      reportType: reportInfo.reportType,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea predicciones de deserción a respuesta
   */
  static toDropoutPredictionResponse(predictionData) {
    return {
      success: true,
      predictions: predictionData.predictions.map((pred) => ({
        user: pred.userInfo,
        dropoutScore: pred.dropoutScore,
        riskLevel: pred.riskLevel,
        metrics: pred.metrics,
        recommendations: pred.recommendations,
        calculatedAt: pred.calculatedAt,
      })),
      type: predictionData.type,
      total: predictionData.predictions.length,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea alertas a respuesta
   */
  static toAlertsResponse(alertsData) {
    return {
      success: true,
      alerts: alertsData.alerts,
      total: alertsData.total,
      summary: alertsData.summary,
      timestamp: alertsData.generatedAt,
    };
  }

  /**
   * Mapea lista de reportes a respuesta
   */
  static toReportsListResponse(reports) {
    return {
      success: true,
      reports: reports.map((report) => ({
        fileName: report.fileName,
        fileSize: report.fileSize,
        format: report.format,
        createdAt: report.createdAt,
        downloadUrl: `/api/analytics/reports/${report.fileName}/download`,
      })),
      total: reports.length,
      timestamp: new Date(),
    };
  }

  /**
   * Mapea error a respuesta
   */
  static toErrorResponse(error) {
    return {
      success: false,
      error: {
        message: error.message || 'An error occurred',
        code: error.code || 'ANALYTICS_ERROR',
      },
      timestamp: new Date(),
    };
  }

  /**
   * Mapea respuesta de éxito genérica
   */
  static toSuccessResponse(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date(),
    };
  }
}

module.exports = AnalyticsMapper;
