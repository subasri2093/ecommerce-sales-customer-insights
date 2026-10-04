/**
 * Employee Attrition Analytics - Application Controller & Chart Engine
 */

const App = (() => {
    // Application State Variables
    let rawDataset = [];
    let processedDataset = [];
    let filteredDataset = [];
    let mlModel = null;
    let chartInstances = {};
    let isPIIMasked = true;
    let selectedSimEmployee = null;

    // Initialization
    function init() {
        console.log('[APP] Initializing Employee Attrition Analytics Platform...');

        // 1. Generate 1,800 synthetic workforce records
        rawDataset = DataEngine.generateDataset(1800, 42);

        // 2. Data Cleaning & Quality Check
        const cleanResult = DataEngine.cleanAndValidateRecords(rawDataset);
        processedDataset = cleanResult.cleanRecords;

        // 3. Fit Logistic Regression ML Solver
        mlModel = DataEngine.fitLogisticRegression(processedDataset);

        // 4. Populate simulator employee dropdown
        populateSimulatorDropdown();

        // 5. Apply global filters & render views
        applyFilters();

        console.log('[APP] Employee Attrition Analytics initialized successfully.');
    }

    // Populate Simulator Employee Dropdown
    function populateSimulatorDropdown() {
        const select = document.getElementById('simEmployeeSelect');
        if (!select) return;

        select.innerHTML = '';
        const highRiskEmps = processedDataset.filter(r => r.exit_status === 0).slice(0, 50);

        highRiskEmps.forEach(emp => {
            const risk = DataEngine.predictEmployeeRisk(emp, mlModel);
            const opt = document.createElement('option');
            opt.value = emp.employee_id;
            const displayId = isPIIMasked ? DataEngine.simpleHash(emp.employee_id) : emp.name || emp.employee_id;
            opt.textContent = `${displayId} (${emp.department} - ${emp.role}) - Base Risk: ${risk.riskPct}%`;
            select.appendChild(opt);
        });

        if (highRiskEmps.length > 0) {
            onSelectSimEmployee(highRiskEmps[0].employee_id);
        }
    }

    // Handle Employee Selection in Simulator
    function onSelectSimEmployee(empIdVal) {
        const select = document.getElementById('simEmployeeSelect');
        const empId = empIdVal || select.value;

        selectedSimEmployee = processedDataset.find(r => r.employee_id === empId || DataEngine.simpleHash(r.employee_id) === empId) || processedDataset[0];

        if (!selectedSimEmployee) return;

        document.getElementById('simEmpDept').textContent = `${selectedSimEmployee.department} / ${selectedSimEmployee.role}`;
        document.getElementById('simEmpComp').textContent = `${selectedSimEmployee.comp_ratio} (${selectedSimEmployee.comp_ratio < 0.95 ? 'Underpaid' : 'Fair'})`;
        document.getElementById('simEmpOT').textContent = selectedSimEmployee.overtime_status;

        document.getElementById('sliderComp').value = selectedSimEmployee.comp_ratio;
        document.getElementById('sliderValComp').textContent = selectedSimEmployee.comp_ratio;

        document.getElementById('sliderOT').value = selectedSimEmployee.overtime_status;
        document.getElementById('sliderValOT').textContent = selectedSimEmployee.overtime_status === 'No' ? 'No (Reduce Burnout)' : 'Yes (Mandatory Overtime)';

        document.getElementById('sliderWLB').value = selectedSimEmployee.work_life_balance;
        document.getElementById('sliderValWLB').textContent = `${selectedSimEmployee.work_life_balance} / 5`;

        document.getElementById('sliderSat').value = selectedSimEmployee.job_satisfaction;
        document.getElementById('sliderValSat').textContent = `${selectedSimEmployee.job_satisfaction} / 5`;

        updateSimulation();
    }

    // Update Simulator Calculation
    function updateSimulation() {
        if (!selectedSimEmployee) return;

        const targetComp = parseFloat(document.getElementById('sliderComp').value);
        const targetOT = document.getElementById('sliderOT').value;
        const targetWLB = parseInt(document.getElementById('sliderWLB').value);
        const targetSat = parseInt(document.getElementById('sliderSat').value);

        document.getElementById('sliderValComp').textContent = targetComp.toFixed(2);
        document.getElementById('sliderValOT').textContent = targetOT === 'No' ? 'No (Reduce Burnout)' : 'Yes (Mandatory Overtime)';
        document.getElementById('sliderValWLB').textContent = `${targetWLB} / 5`;
        document.getElementById('sliderValSat').textContent = `${targetSat} / 5`;

        const adjustments = {
            comp_ratio: targetComp,
            overtime_status: targetOT,
            work_life_balance: targetWLB,
            job_satisfaction: targetSat
        };

        const simResult = DataEngine.simulateRetentionIntervention(selectedSimEmployee, adjustments, mlModel);

        document.getElementById('simBaseRiskPct').textContent = `${simResult.baseRiskPct}%`;
        document.getElementById('simDisplayBaseRisk').textContent = `${simResult.baseRiskPct}%`;

        document.getElementById('simDisplayNewRisk').textContent = `${simResult.simRiskPct}%`;
        
        const newBadge = document.getElementById('simDisplayNewBadge');
        if (simResult.simRiskPct < 30) {
            newBadge.textContent = 'Retained / Low Risk';
            newBadge.className = 'badge badge-success';
        } else if (simResult.simRiskPct < 50) {
            newBadge.textContent = 'Moderate Risk';
            newBadge.className = 'badge badge-warning';
        } else {
            newBadge.textContent = 'High Attrition Risk';
            newBadge.className = 'badge badge-danger';
        }

        document.getElementById('simSavings').textContent = `$${simResult.turnoverSavings.toLocaleString()}`;
        document.getElementById('simSalaryCost').textContent = `$${simResult.salaryCostDelta.toLocaleString()}`;

        const netROIEl = document.getElementById('simNetROI');
        netROIEl.textContent = `$${simResult.netROI.toLocaleString()}`;
        netROIEl.style.color = simResult.netROI >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';

        const listEl = document.getElementById('interventionRecommendationsList');
        listEl.innerHTML = '';

        const recs = [];
        if (targetComp > selectedSimEmployee.comp_ratio) {
            recs.push(`💰 <strong>Salary Parity Adjustment:</strong> Increase comp ratio from ${selectedSimEmployee.comp_ratio} to ${targetComp.toFixed(2)} (+${Math.round((targetComp - selectedSimEmployee.comp_ratio)*100)}% base pay bump).`);
        }
        if (selectedSimEmployee.overtime_status === 'Yes' && targetOT === 'No') {
            recs.push(`🛑 <strong>Workload Relief:</strong> Transition employee out of mandatory overtime shift to curb acute burnout.`);
        }
        if (targetWLB > selectedSimEmployee.work_life_balance) {
            recs.push(`🏡 <strong>Flexible Work Policy:</strong> Offer hybrid/remote schedule options to improve work-life balance score.`);
        }
        if (recs.length === 0) {
            recs.push(`✅ Current retention parameters are maintained.`);
        }

        recs.forEach(r => {
            const div = document.createElement('div');
            div.style.cssText = 'background:var(--bg-secondary); padding:10px 14px; border-radius:6px; font-size:13px; border:1px solid var(--border-color);';
            div.innerHTML = r;
            listEl.appendChild(div);
        });
    }

    // Apply Global Filters
    function applyFilters() {
        const deptVal = document.getElementById('filterDepartment').value;
        const tenureVal = document.getElementById('filterTenureBand').value;
        const levelVal = document.getElementById('filterJobLevel').value;
        const perfVal = document.getElementById('filterPerformance').value;
        const otVal = document.getElementById('filterOvertime').value;

        filteredDataset = processedDataset.filter(r => {
            if (deptVal !== 'all' && r.department !== deptVal) return false;
            if (tenureVal !== 'all' && r.tenure_band !== tenureVal) return false;
            if (levelVal !== 'all' && r.job_level !== levelVal) return false;
            if (perfVal !== 'all' && String(r.performance_rating) !== perfVal) return false;
            if (otVal !== 'all' && r.overtime_status !== otVal) return false;
            return true;
        });

        const metrics = DataEngine.calculateDerivedMetrics(filteredDataset);
        renderKPIs(metrics);

        renderOverviewCharts(filteredDataset);
        renderDriverCharts(filteredDataset);
        renderStatisticalLab(filteredDataset);
        renderTable();
    }

    // Reset Filters
    function resetFilters() {
        document.getElementById('filterDepartment').value = 'all';
        document.getElementById('filterTenureBand').value = 'all';
        document.getElementById('filterJobLevel').value = 'all';
        document.getElementById('filterPerformance').value = 'all';
        document.getElementById('filterOvertime').value = 'all';
        applyFilters();
    }

    // Render KPIs
    function renderKPIs(m) {
        if (!m) return;

        document.getElementById('kpiOverallAttrition').textContent = `${m.overallAttritionRate}%`;
        document.getElementById('kpiOverallSubtext').textContent = `${m.totalDeparted} Departed / ${m.totalHeadcount} Total`;

        document.getElementById('kpiEarlyTenure').textContent = `${m.earlyTenureAttritionRate}%`;
        document.getElementById('kpiRegrettable').textContent = `${m.regrettableRate}%`;
        document.getElementById('kpiRegrettableSubtext').textContent = `${m.regrettableCount} High-Performers Left`;

        document.getElementById('kpiTurnoverCost').textContent = `$${(m.totalTurnoverCost / 1000000).toFixed(2)}M`;
    }

    // Tab Switching
    function switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    // Toggle PII Masking
    function toggleAnonymization() {
        isPIIMasked = !isPIIMasked;
        const badge = document.getElementById('privacyStatusBadge');
        const text = document.getElementById('privacyStatusText');

        if (isPIIMasked) {
            badge.className = 'privacy-indicator-badge';
            text.textContent = '🛡️ PII Masked & Hash Secured';
        } else {
            badge.className = 'privacy-indicator-badge unmasked';
            text.textContent = '⚠️ Unmasked PII (Sensitive View)';
        }

        populateSimulatorDropdown();
        renderTable();
    }

    // Test Hash ID Tool
    function testHashId() {
        const val = document.getElementById('hashInputId').value;
        const hash = DataEngine.simpleHash(val);
        document.getElementById('hashOutputResult').textContent = hash;
    }

    // Chart Renderer Helper
    function createOrUpdateChart(canvasId, type, data, options) {
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }
        const ctx = document.getElementById(canvasId).getContext('2d');
        chartInstances[canvasId] = new Chart(ctx, { type, data, options });
    }

    // Render Executive Overview Charts
    function renderOverviewCharts(data) {
        // Monthly Trend
        const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
        const volCounts = months.map(m => data.filter(r => r.exit_status === 1 && r.exit_month === m && r.exit_type === 'Voluntary').length);
        const involCounts = months.map(m => data.filter(r => r.exit_status === 1 && r.exit_month === m && r.exit_type === 'Involuntary').length);

        createOrUpdateChart('chartMonthlyTrend', 'line', {
            labels: months,
            datasets: [
                { label: 'Voluntary Exits', data: volCounts, borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', fill: true, tension: 0.3 },
                { label: 'Involuntary Exits', data: involCounts, borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.15)', fill: true, tension: 0.3 }
            ]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } });

        // Department Attrition Bar
        const depts = DataEngine.DEPARTMENTS;
        const deptRates = depts.map(d => {
            const group = data.filter(r => r.department === d);
            const dep = group.filter(r => r.exit_status === 1).length;
            return group.length > 0 ? parseFloat(((dep / group.length) * 100).toFixed(1)) : 0;
        });

        createOrUpdateChart('chartDeptAttrition', 'bar', {
            labels: depts,
            datasets: [{
                label: 'Attrition Rate (%)',
                data: deptRates,
                backgroundColor: deptRates.map(r => r > 20 ? 'rgba(244, 63, 94, 0.8)' : 'rgba(99, 102, 241, 0.8)'),
                borderRadius: 6
            }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } });

        // Tenure Curve
        const bands = ['<6 Months', '6-12 Months', '1-2 Years', '2-5 Years', '5+ Years'];
        const bandRates = bands.map(b => {
            const group = data.filter(r => r.tenure_band === b);
            const dep = group.filter(r => r.exit_status === 1).length;
            return group.length > 0 ? parseFloat(((dep / group.length) * 100).toFixed(1)) : 0;
        });

        createOrUpdateChart('chartTenureCurve', 'bar', {
            labels: bands,
            datasets: [{
                label: 'Turnover % by Tenure',
                data: bandRates,
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                borderRadius: 6
            }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } });

        // Exit Type Doughnut
        const volTotal = data.filter(r => r.exit_status === 1 && r.exit_type === 'Voluntary').length;
        const involTotal = data.filter(r => r.exit_status === 1 && r.exit_type === 'Involuntary').length;

        createOrUpdateChart('chartExitType', 'doughnut', {
            labels: ['Voluntary Resignation', 'Involuntary Termination'],
            datasets: [{
                data: [volTotal, involTotal],
                backgroundColor: ['#38bdf8', '#f43f5e'],
                borderWidth: 0
            }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } } });
    }

    // Render Driver Charts
    function renderDriverCharts(data) {
        const otYes = data.filter(r => r.overtime_status === 'Yes');
        const otNo = data.filter(r => r.overtime_status === 'No');

        const rateOTYes = otYes.length > 0 ? ((otYes.filter(r => r.exit_status === 1).length / otYes.length) * 100).toFixed(1) : 0;
        const rateOTNo = otNo.length > 0 ? ((otNo.filter(r => r.exit_status === 1).length / otNo.length) * 100).toFixed(1) : 0;

        createOrUpdateChart('chartOvertimeBurnout', 'bar', {
            labels: ['Overtime Required (Yes)', 'No Overtime (No)'],
            datasets: [{
                label: 'Attrition Rate (%)',
                data: [rateOTYes, rateOTNo],
                backgroundColor: ['rgba(244, 63, 94, 0.85)', 'rgba(16, 185, 129, 0.85)'],
                borderRadius: 8
            }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } });

        const activeGroup = data.filter(r => r.exit_status === 0);
        const departedGroup = data.filter(r => r.exit_status === 1);

        const avgScore = (grp, key) => grp.length > 0 ? grp.reduce((s, r) => s + r[key], 0) / grp.length : 0;

        createOrUpdateChart('chartSatisfactionRadar', 'radar', {
            labels: ['Job Satisfaction', 'Work Environment', 'Work-Life Balance'],
            datasets: [
                { label: 'Active Employees', data: [avgScore(activeGroup, 'job_satisfaction'), avgScore(activeGroup, 'environment_satisfaction'), avgScore(activeGroup, 'work_life_balance')], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)' },
                { label: 'Departed Employees', data: [avgScore(departedGroup, 'job_satisfaction'), avgScore(departedGroup, 'environment_satisfaction'), avgScore(departedGroup, 'work_life_balance')], borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.2)' }
            ]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#9ca3af' } } } });

        const scatterActive = activeGroup.slice(0, 150).map(r => ({ x: r.tenure_years, y: r.comp_ratio }));
        const scatterDeparted = departedGroup.slice(0, 150).map(r => ({ x: r.tenure_years, y: r.comp_ratio }));

        createOrUpdateChart('chartCompScatter', 'scatter', {
            datasets: [
                { label: 'Active', data: scatterActive, backgroundColor: 'rgba(16, 185, 129, 0.6)' },
                { label: 'Departed', data: scatterDeparted, backgroundColor: 'rgba(244, 63, 94, 0.7)' }
            ]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { title: { display: true, text: 'Tenure (Years)', color: '#9ca3af' }, ticks: { color: '#9ca3af' } }, y: { title: { display: true, text: 'Comp Ratio (Pay Parity)', color: '#9ca3af' }, ticks: { color: '#9ca3af' } } } });

        const promYears = ['0-1 Yr', '1-2 Yrs', '2-3 Yrs', '3-4 Yrs', '4+ Yrs'];
        const highPerfDepartures = promYears.map((_, idx) => {
            return data.filter(r => r.exit_status === 1 && r.performance_rating >= 4 && r.years_since_last_promotion >= idx && r.years_since_last_promotion < idx + 1).length;
        });

        createOrUpdateChart('chartPromotionStagnation', 'bar', {
            labels: promYears,
            datasets: [{
                label: 'High Performer Departures',
                data: highPerfDepartures,
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderRadius: 6
            }]
        }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } });
    }

    // Render Statistical & ML Lab View
    function renderStatisticalLab(data) {
        const chiFeatures = ['department', 'overtime_status', 'tenure_band', 'job_level'];
        const tbodyChi = document.getElementById('tableChiSquare');
        tbodyChi.innerHTML = '';

        chiFeatures.forEach(feat => {
            const res = DataEngine.runChiSquareTest(data, feat);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${feat}</strong></td>
                <td>${res.chiSquare}</td>
                <td>${res.df}</td>
                <td>${res.pValue < 0.01 ? '< 0.01' : res.pValue}</td>
                <td>${res.cramersV}</td>
                <td><span class="stat-pill ${res.isSignificant ? 'sig' : 'non-sig'}">${res.isSignificant ? 'Statistically Significant' : 'Not Significant'}</span></td>
            `;
            tbodyChi.appendChild(tr);
        });

        const numericKeys = ['avg_monthly_hours', 'comp_ratio', 'years_since_last_promotion', 'commute_distance_km'];
        const tbodyT = document.getElementById('tableTTest');
        tbodyT.innerHTML = '';

        numericKeys.forEach(key => {
            const res = DataEngine.runWelchTTest(data, key);
            if (!res) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${key}</strong></td>
                <td>${res.meanActive}</td>
                <td>${res.meanDeparted}</td>
                <td style="color:${res.diff > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}">${res.diff > 0 ? '+' : ''}${res.diff}</td>
                <td>${res.tStat}</td>
                <td><span class="stat-pill ${res.isSignificant ? 'sig' : 'non-sig'}">${res.pValue < 0.01 ? '< 0.01' : res.pValue}</span></td>
            `;
            tbodyT.appendChild(tr);
        });

        if (mlModel) {
            document.getElementById('mlAccuracy').textContent = `${mlModel.accuracy}%`;
            document.getElementById('mlPrecision').textContent = `${mlModel.precision}%`;
            document.getElementById('mlRecall').textContent = `${mlModel.recall}%`;
            document.getElementById('mlF1').textContent = mlModel.f1Score;
            document.getElementById('mlAUC').textContent = mlModel.auc;

            const tbodyReg = document.getElementById('tableRegressionCoeffs');
            tbodyReg.innerHTML = '';

            mlModel.coefficients.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.feature}</strong></td>
                    <td>${c.coefficient}</td>
                    <td><strong style="color:${c.oddsRatio > 1.0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}">${c.oddsRatio}x</strong></td>
                    <td>${c.zScore}</td>
                    <td>${c.pValue < 0.01 ? '< 0.01' : c.pValue}</td>
                    <td><span class="badge ${c.oddsRatio > 1.0 ? 'badge-danger' : 'badge-success'}">${c.impact}</span></td>
                `;
                tbodyReg.appendChild(tr);
            });

            const rocLabels = mlModel.rocPoints.map(p => p.fpr);
            const rocTPR = mlModel.rocPoints.map(p => p.tpr);

            createOrUpdateChart('chartROC', 'line', {
                labels: rocLabels,
                datasets: [
                    { label: 'Logistic Regression Model', data: rocTPR, borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', fill: true },
                    { label: 'Random Classifier (AUC=0.5)', data: rocLabels, borderColor: '#6b7280', borderDash: [4, 4], fill: false }
                ]
            }, { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'False Positive Rate (FPR)', color: '#9ca3af' }, ticks: { color: '#9ca3af' } }, y: { title: { display: true, text: 'True Positive Rate (TPR)', color: '#9ca3af' }, ticks: { color: '#9ca3af' } } } });
        }
    }

    // Render Workforce Master Explorer Table
    function renderTable() {
        const tbody = document.getElementById('tableMasterExplorer');
        if (!tbody) return;

        const search = (document.getElementById('tableSearchInput')?.value || '').toLowerCase();
        tbody.innerHTML = '';

        const displayRows = filteredDataset.filter(r => {
            if (!search) return true;
            return r.department.toLowerCase().includes(search) || 
                   r.role.toLowerCase().includes(search) || 
                   r.employee_id.toLowerCase().includes(search);
        }).slice(0, 100);

        displayRows.forEach(r => {
            const risk = DataEngine.predictEmployeeRisk(r, mlModel);
            const displayId = isPIIMasked ? DataEngine.simpleHash(r.employee_id) : r.name || r.employee_id;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${displayId}</code></td>
                <td>${r.department}</td>
                <td>${r.role} (${r.job_level})</td>
                <td>${r.tenure_years} yrs (${r.tenure_band})</td>
                <td>$${r.monthly_salary.toLocaleString()}/mo</td>
                <td><strong style="color:${r.comp_ratio < 0.9 ? 'var(--accent-rose)' : 'var(--text-main)'}">${r.comp_ratio}</strong></td>
                <td>${r.performance_rating} / 5</td>
                <td>${r.overtime_status === 'Yes' ? '<span class="badge badge-danger">Overtime</span>' : '<span class="badge badge-success">Normal</span>'}</td>
                <td>${r.exit_status === 1 ? `<span class="badge badge-danger">Departed (${r.exit_type})</span>` : '<span class="badge badge-success">Active</span>'}</td>
                <td><span class="badge ${risk.badgeClass}">${risk.riskPct}% (${risk.tier})</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Export Filtered CSV
    function exportReportCSV() {
        const csv = Papa.unparse(filteredDataset);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Employee_Attrition_Insights_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal Handling
    function openUploadModal() { document.getElementById('uploadModal').classList.add('active'); }
    function closeUploadModal() { document.getElementById('uploadModal').classList.remove('active'); }

    function handleCSVUpload() {
        const fileInput = document.getElementById('csvFileInput');
        if (!fileInput.files.length) {
            alert('Please select a CSV file first.');
            return;
        }

        Papa.parse(fileInput.files[0], {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                const cleanResult = DataEngine.cleanAndValidateRecords(results.data);
                processedDataset = cleanResult.cleanRecords;
                mlModel = DataEngine.fitLogisticRegression(processedDataset);
                populateSimulatorDropdown();
                applyFilters();
                closeUploadModal();
                alert(`Successfully parsed and loaded ${processedDataset.length} workforce records!`);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        applyFilters,
        resetFilters,
        switchTab,
        toggleAnonymization,
        testHashId,
        onSelectSimEmployee,
        updateSimulation,
        renderTable,
        exportReportCSV,
        openUploadModal,
        closeUploadModal,
        handleCSVUpload
    };
})();
