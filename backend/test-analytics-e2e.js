/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/**
 * E2E Testing - MD06: Analytics & Reports
 * Tests completos para los 8 endpoints de Analytics
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const authTokens = {
  student: null,
  teacher: null,
  admin: null,
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Helper: Log con color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Helper: Login para obtener tokens
 */
async function login(email, password, role) {
  try {
    log(`\n🔐 Logging in as ${role}...`, 'cyan');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.success && response.data.data.accessToken) {
      authTokens[role] = response.data.data.accessToken;
      log(`✅ ${role} logged in successfully`, 'green');
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ Login failed for ${role}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test 1: GET /api/analytics/dashboard
 */
// eslint-disable-next-line consistent-return
async function testGetDashboard() {
  log('\n📊 TEST 1: GET /api/analytics/dashboard', 'blue');

  try {
    const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Dashboard data retrieved successfully', 'green');
      log(`   - Total Students: ${response.data.data.overview.totalStudents}`);
      log(`   - Total Teachers: ${response.data.data.overview.totalTeachers}`);
      log(`   - Active Users: ${response.data.data.overview.activeUsers}`);
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 2: GET /api/analytics/comparative
 */
// eslint-disable-next-line consistent-return
async function testGetComparative() {
  log('\n📈 TEST 2: GET /api/analytics/comparative', 'blue');

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const response = await axios.get(`${BASE_URL}/analytics/comparative`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
      params: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        compareToStartDate: sixtyDaysAgo.toISOString(),
        compareToEndDate: thirtyDaysAgo.toISOString(),
        metric: 'all',
      },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Comparative data retrieved successfully', 'green');
      log(`   - Users Growth: ${response.data.data.comparison.usersGrowth}%`);
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 3: POST /api/analytics/reports/generate (PDF)
 */
// eslint-disable-next-line consistent-return
async function testGenerateReportPDF() {
  log('\n📄 TEST 3: POST /api/analytics/reports/generate (PDF)', 'blue');

  try {
    const response = await axios.post(
      `${BASE_URL}/analytics/reports/generate`,
      {
        reportType: 'general',
        format: 'PDF',
        includeCharts: false,
      },
      {
        headers: { Authorization: `Bearer ${authTokens.admin}` },
      }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 201 && response.data.success) {
      log('✅ PASS: PDF report generated successfully', 'green');
      log(`   - File: ${response.data.report.fileName}`);
      log(`   - Size: ${(response.data.report.fileSize / 1024).toFixed(2)} KB`);
      return response.data.report.fileName;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * Test 4: POST /api/analytics/reports/generate (EXCEL)
 */
// eslint-disable-next-line consistent-return
async function testGenerateReportExcel() {
  log('\n📊 TEST 4: POST /api/analytics/reports/generate (EXCEL)', 'blue');

  try {
    const response = await axios.post(
      `${BASE_URL}/analytics/reports/generate`,
      {
        reportType: 'enrollment',
        format: 'EXCEL',
        includeCharts: false,
      },
      {
        headers: { Authorization: `Bearer ${authTokens.admin}` },
      }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 201 && response.data.success) {
      log('✅ PASS: Excel report generated successfully', 'green');
      log(`   - File: ${response.data.report.fileName}`);
      log(`   - Size: ${(response.data.report.fileSize / 1024).toFixed(2)} KB`);
      return response.data.report.fileName;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * Test 5: GET /api/analytics/reports
 */
// eslint-disable-next-line consistent-return
async function testListReports() {
  log('\n📋 TEST 5: GET /api/analytics/reports', 'blue');

  try {
    const response = await axios.get(`${BASE_URL}/analytics/reports`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Reports listed successfully', 'green');
      log(`   - Total Reports: ${response.data.total}`);
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 6: GET /api/analytics/reports/:fileName/download
 */
// eslint-disable-next-line consistent-return
async function testDownloadReport(fileName) {
  log('\n💾 TEST 6: GET /api/analytics/reports/:fileName/download', 'blue');

  if (!fileName) {
    log('⚠️  SKIP: No fileName provided', 'yellow');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/analytics/reports/${fileName}/download`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
      responseType: 'arraybuffer',
    });

    if (response.status === 200) {
      log('✅ PASS: Report downloaded successfully', 'green');
      log(`   - File Size: ${(response.data.byteLength / 1024).toFixed(2)} KB`);
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 7: POST /api/analytics/predictions/dropout-risk
 */
// eslint-disable-next-line consistent-return
async function testPredictDropoutRisk() {
  log('\n🧠 TEST 7: POST /api/analytics/predictions/dropout-risk', 'blue');

  try {
    const response = await axios.post(
      `${BASE_URL}/analytics/predictions/dropout-risk`,
      {
        // Sin userId = predecir para todos los estudiantes
      },
      {
        headers: { Authorization: `Bearer ${authTokens.admin}` },
      }
    );

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Dropout predictions generated successfully', 'green');
      log(`   - Total Predictions: ${response.data.total}`);

      if (response.data.predictions.length > 0) {
        const highRisk = response.data.predictions.filter((p) => p.riskLevel === 'HIGH').length;
        log(`   - High Risk Students: ${highRisk}`);
      }
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 8: GET /api/analytics/alerts
 */
// eslint-disable-next-line consistent-return
async function testGetAlerts() {
  log('\n🚨 TEST 8: GET /api/analytics/alerts', 'blue');

  try {
    const response = await axios.get(`${BASE_URL}/analytics/alerts`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
      params: {
        limit: 50,
      },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Alerts retrieved successfully', 'green');
      log(`   - Total Alerts: ${response.data.total}`);
      log(`   - Critical: ${response.data.summary.bySeverity.CRITICAL}`);
      log(`   - High: ${response.data.summary.bySeverity.HIGH}`);
      log(`   - Medium: ${response.data.summary.bySeverity.MEDIUM}`);
      log(`   - Low: ${response.data.summary.bySeverity.LOW}`);
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Test 9: DELETE /api/analytics/reports/:fileName (Cleanup)
 */
// eslint-disable-next-line consistent-return
async function testDeleteReport(fileName) {
  log('\n🗑️  TEST 9: DELETE /api/analytics/reports/:fileName', 'blue');

  if (!fileName) {
    log('⚠️  SKIP: No fileName provided', 'yellow');
    return false;
  }

  try {
    const response = await axios.delete(`${BASE_URL}/analytics/reports/${fileName}`, {
      headers: { Authorization: `Bearer ${authTokens.admin}` },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.success) {
      log('✅ PASS: Report deleted successfully', 'green');
      return true;
    }
  } catch (error) {
    log(`❌ FAIL: ${error.response?.data?.error?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('🧪 SMART CAMPUS - MD06 ANALYTICS E2E TESTING', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    // Login
    const adminLoggedIn = await login('admin@smartcampus.edu.pe', 'Admin123', 'admin');
    if (!adminLoggedIn) {
      log('\n❌ Cannot proceed without admin authentication', 'red');
      process.exit(1);
    }

    // Tests
    const tests = [
      { name: 'Dashboard', fn: testGetDashboard },
      { name: 'Comparative', fn: testGetComparative },
    ];

    // Test 3 & 4: Generate reports
    const pdfFileName = await testGenerateReportPDF();
    // eslint-disable-next-line no-plusplus
    if (pdfFileName) results.passed++;
    // eslint-disable-next-line no-plusplus
    else results.failed++;

    const excelFileName = await testGenerateReportExcel();
    if (excelFileName) results.passed++;
    else results.failed++;

    // Test 5: List reports
    if (await testListReports()) results.passed++;
    else results.failed++;

    // Test 6: Download report
    if (await testDownloadReport(pdfFileName)) results.passed++;
    else results.failed++;

    // Test 7: Predict dropout
    if (await testPredictDropoutRisk()) results.passed++;
    else results.failed++;

    // Test 8: Get alerts
    if (await testGetAlerts()) results.passed++;
    else results.failed++;

    // Test 1 & 2
    // eslint-disable-next-line no-restricted-syntax
    for (const test of tests) {
      if (await test.fn()) results.passed++;
      else results.failed++;
    }

    // Cleanup: Delete test reports
    if (pdfFileName) {
      if (await testDeleteReport(pdfFileName)) results.passed++;
      else results.failed++;
    }
    if (excelFileName) {
      if (await testDeleteReport(excelFileName)) results.passed++;
      else results.failed++;
    }

    // Summary
    log(`\n${'='.repeat(60)}`, 'cyan');
    log('📊 TEST SUMMARY', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`✅ Passed: ${results.passed}`, 'green');
    log(`❌ Failed: ${results.failed}`, 'red');
    log(`⚠️  Skipped: ${results.skipped}`, 'yellow');
    log(
      `📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`,
      'cyan'
    );
    log(`${'='.repeat(60)}\n`, 'cyan');

    if (results.failed === 0) {
      log('🎉 ALL TESTS PASSED! MD06 IS READY! 🚀\n', 'green');
      process.exit(0);
    } else {
      log('⚠️  SOME TESTS FAILED. CHECK LOGS ABOVE.\n', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar tests
runAllTests();
