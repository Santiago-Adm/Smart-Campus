/**
 * Analytics Controller
 * Maneja endpoints de analítica y reportes
 */

// eslint-disable-next-line no-unused-vars
const path = require('path');
const DashboardDataDto = require('../../../application/dtos/analytics/DashboardDataDto');
const GenerateReportDto = require('../../../application/dtos/analytics/GenerateReportDto');
const PredictDropoutDto = require('../../../application/dtos/analytics/PredictDropoutDto');
const GetAlertsDto = require('../../../application/dtos/analytics/GetAlertsDto');
const AnalyticsMapper = require('../../../application/mappers/AnalyticsMapper');

class AnalyticsController {
  constructor({
    getDashboardDataUseCase,
    getComparativeDataUseCase,
    generateReportUseCase,
    predictDropoutRiskUseCase,
    getAlertsUseCase,
    reportGeneratorService,
  }) {
    this.getDashboardDataUseCase = getDashboardDataUseCase;
    this.getComparativeDataUseCase = getComparativeDataUseCase;
    this.generateReportUseCase = generateReportUseCase;
    this.predictDropoutRiskUseCase = predictDropoutRiskUseCase;
    this.getAlertsUseCase = getAlertsUseCase;
    this.reportGeneratorService = reportGeneratorService;
  }

  /**
   * GET /api/analytics/dashboard
   * Obtener datos del dashboard
   */
  async getDashboard(req, res) {
    try {
      // Extraer userId y userRole del token JWT (ya autenticado)
      const userId = req.user?.userId || null;
      const userRole = req.user?.roles?.[0] || null;

      // Permitir override de query params (para admins)
      const dashboardDto = new DashboardDataDto({
        userId: req.query.userId || userId,
        userRole: req.query.userRole || userRole,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      });

      const dashboardData = await this.getDashboardDataUseCase.execute(dashboardDto.toObject());

      const response = AnalyticsMapper.toDashboardResponse(dashboardData);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getDashboard:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/analytics/comparative
   * Obtener datos comparativos entre períodos
   */
  async getComparative(req, res) {
    try {
      const comparativeData = await this.getComparativeDataUseCase.execute({
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        compareToStartDate: req.query.compareToStartDate,
        compareToEndDate: req.query.compareToEndDate,
        metric: req.query.metric || 'all',
      });

      const response = AnalyticsMapper.toComparativeResponse(comparativeData);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getComparative:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * POST /api/analytics/reports/generate
   * Generar reporte personalizado
   */
  async generateReport(req, res) {
    try {
      const userId = req.user?.userId || null;
      const userRole = req.user?.roles?.[0] || null;

      const reportDto = new GenerateReportDto({
        reportType: req.body.reportType,
        format: req.body.format || 'PDF',
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        userId: req.body.userId || userId,
        userRole: req.body.userRole || userRole,
        includeCharts: req.body.includeCharts || false,
      });

      const reportInfo = await this.generateReportUseCase.execute(reportDto.toObject());

      const response = AnalyticsMapper.toReportResponse(reportInfo);
      return res.status(201).json(response);
    } catch (error) {
      console.error('Error in generateReport:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/analytics/reports
   * Listar reportes generados
   */
  async listReports(req, res) {
    try {
      const reports = await this.reportGeneratorService.listReports();

      const response = AnalyticsMapper.toReportsListResponse(reports);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in listReports:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/analytics/reports/:fileName/download
   * Descargar reporte generado
   */
  async downloadReport(req, res) {
    try {
      const { fileName } = req.params;

      // Validar que el archivo existe
      const reports = await this.reportGeneratorService.listReports();
      const report = reports.find((r) => r.fileName === fileName);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found' },
          timestamp: new Date(),
        });
      }

      // Enviar archivo
      // eslint-disable-next-line consistent-return
      return res.download(report.filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading report:', err);
          return res.status(500).json({
            success: false,
            error: { message: 'Error downloading report' },
            timestamp: new Date(),
          });
        }
      });
    } catch (error) {
      console.error('Error in downloadReport:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * DELETE /api/analytics/reports/:fileName
   * Eliminar reporte
   */
  async deleteReport(req, res) {
    try {
      const { fileName } = req.params;

      await this.reportGeneratorService.deleteReport(fileName);

      const response = AnalyticsMapper.toSuccessResponse(null, 'Report deleted successfully');
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in deleteReport:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * POST /api/analytics/predictions/dropout-risk
   * Predecir riesgo de deserción
   */
  async predictDropoutRisk(req, res) {
    try {
      const dropoutDto = new PredictDropoutDto({
        userId: req.body.userId || null,
        userIds: req.body.userIds || null,
      });

      const predictions = await this.predictDropoutRiskUseCase.execute(dropoutDto.toObject());

      const response = AnalyticsMapper.toDropoutPredictionResponse(predictions);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in predictDropoutRisk:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }

  /**
   * GET /api/analytics/alerts
   * Obtener alertas del sistema
   */
  async getAlerts(req, res) {
    try {
      const alertsDto = new GetAlertsDto({
        severity: req.query.severity || null,
        category: req.query.category || null,
        limit: req.query.limit || 50,
      });

      const alerts = await this.getAlertsUseCase.execute(alertsDto.toObject());

      const response = AnalyticsMapper.toAlertsResponse(alerts);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in getAlerts:', error);
      const response = AnalyticsMapper.toErrorResponse(error);
      return res.status(400).json(response);
    }
  }
}

module.exports = AnalyticsController;
