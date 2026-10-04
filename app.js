/**
 * E-commerce Sales & Customer Insights Analytics - Application Controller & Chart Engine
 */

const App = (() => {
    // Application State Variables
    let rawDataset = null;
    let cleanDataset = null;
    let filteredOrderItems = [];
    let currentKPIs = null;
    let monthlyTrends = [];
    let cohortMatrix = [];
    let rfmData = null;
    let productAnalytics = null;
    let regionalAnalytics = [];
    let recommendations = [];
    let chartInstances = {};

    // Initialization
    function init() {
        console.log('[APP] Initializing E-Commerce Sales & Customer Insights Analytics Platform...');

        // 1. Generate multi-relational synthetic dataset (Jan 2024 - Sep 2025)
        rawDataset = DataEngine.generateSyntheticDataset(101);

        // 2. Execute Data Quality Cleaning & Normalization Pipeline
        cleanDataset = DataEngine.cleanAndNormalizeDataset(rawDataset);

        // 3. Update Data Health Score badge in header
        updateDataHealthBadge();

        // 4. Apply initial filters & calculate metrics
        applyFilters();

        console.log('[APP] Platform Ready.');
    }

    // Update Data Quality Badge in Header
    function updateDataHealthBadge() {
        const badgeText = document.getElementById('dataQualityText');
        const audit = cleanDataset.auditReport;
        if (badgeText && audit) {
            badgeText.textContent = `🛡️ Data Quality Index: ${audit.qualityScore}%`;
        }
    }

    // Global Filter Processor
    function applyFilters() {
        if (!cleanDataset || !cleanDataset.cleanOrderItems) return;

        const dateRange = document.getElementById('filterDateRange').value;
        const category = document.getElementById('filterCategory').value;
        const region = document.getElementById('filterRegion').value;
        const segment = document.getElementById('filterSegment').value;
        const status = document.getElementById('filterStatus').value;
        const searchQuery = (document.getElementById('filterSearch').value || '').toLowerCase().trim();

        // Customer Map for Segment filtering
        const customerMap = new Map(cleanDataset.customers.map(c => [c.customer_id, c]));

        filteredOrderItems = cleanDataset.cleanOrderItems.filter(item => {
            // Filter 1: Date Range
            if (dateRange === '2024') {
                if (!item.order_date.startsWith('2024')) return false;
            } else if (dateRange === 'YTD') {
                if (!item.order_date.startsWith('2025')) return false;
            } else if (dateRange === 'L90D') {
                if (new Date(item.order_date) < new Date('2025-07-01')) return false;
            } else if (dateRange === 'L30D') {
                if (new Date(item.order_date) < new Date('2025-09-01')) return false;
            }

            // Filter 2: Category
            if (category !== 'all' && item.category !== category) return false;

            // Filter 3: Region
            if (region !== 'all' && item.region !== region) return false;

            // Filter 4: Segment
            if (segment !== 'all') {
                const cust = customerMap.get(item.customer_id);
                if (!cust || cust.segment !== segment) return false;
            }

            // Filter 5: Order Status
            if (status !== 'all') {
                if (status === 'Completed' && item.order_status !== 'Completed' && item.order_status !== 'Shipped') return false;
                if (status === 'Refunded' && item.order_status !== 'Refunded') return false;
                if (status === 'Processing' && item.order_status !== 'Processing') return false;
                if (status === 'Cancelled' && item.order_status !== 'Cancelled') return false;
            }

            // Filter 6: Search Query (Product, Customer ID, Order ID)
            if (searchQuery) {
                const matchProd = (item.product_id || '').toLowerCase().includes(searchQuery);
                const matchOrder = (item.order_id || '').toLowerCase().includes(searchQuery);
                const matchCust = (item.customer_id || '').toLowerCase().includes(searchQuery);
                const matchCat = (item.category || '').toLowerCase().includes(searchQuery);
                if (!matchProd && !matchOrder && !matchCust && !matchCat) return false;
            }

            return true;
        });

        // Compute Analytical Engine Outputs for Filtered Subset
        currentKPIs = DataEngine.calculateKPIs(filteredOrderItems);
        monthlyTrends = DataEngine.calculateMonthlyTrends(filteredOrderItems);
        cohortMatrix = DataEngine.calculateCohortMatrix(filteredOrderItems, cleanDataset.customers);
        rfmData = DataEngine.calculateRFMSegments(filteredOrderItems, cleanDataset.customers);
        productAnalytics = DataEngine.calculateProductAnalytics(filteredOrderItems);
        regionalAnalytics = DataEngine.calculateRegionalAnalytics(filteredOrderItems);
        recommendations = DataEngine.generateStrategicRecommendations(currentKPIs, productAnalytics, rfmData, regionalAnalytics);

        // Render UI Elements
        renderKPIs();
        renderCharts();
        renderTables();
        renderAuditLogs();
        renderRecommendations();
        runSimulation();
    }

    // Reset Filters
    function resetFilters() {
        document.getElementById('filterDateRange').value = 'all';
        document.getElementById('filterCategory').value = 'all';
        document.getElementById('filterRegion').value = 'all';
        document.getElementById('filterSegment').value = 'all';
        document.getElementById('filterStatus').value = 'all';
        document.getElementById('filterSearch').value = '';
        applyFilters();
    }

    // Render KPI Cards
    function renderKPIs() {
        if (!currentKPIs) return;

        document.getElementById('kpiGrossRev').textContent = `$${currentKPIs.grossRevenue.toLocaleString()}`;
        document.getElementById('kpiNetRev').textContent = `$${currentKPIs.netRevenue.toLocaleString()}`;
        document.getElementById('kpiNetRevSub').textContent = `Realized revenue (${currentKPIs.totalUnitsSold.toLocaleString()} units sold)`;

        document.getElementById('kpiTotalOrders').textContent = currentKPIs.totalOrders.toLocaleString();
        document.getElementById('kpiOrdersSub').textContent = `${currentKPIs.completedOrders.toLocaleString()} completed, ${currentKPIs.refundedOrders.toLocaleString()} refunded (${currentKPIs.refundRate}%)`;

        document.getElementById('kpiAOV').textContent = `$${currentKPIs.aov.toFixed(2)}`;
        document.getElementById('kpiMarginPct').textContent = `${currentKPIs.profitMarginPct}%`;
        document.getElementById('kpiProfitSub').textContent = `Total Profit: $${currentKPIs.totalProfit.toLocaleString()}`;

        document.getElementById('kpiRepeatRate').textContent = `${currentKPIs.repeatCustomerRate}%`;
        document.getElementById('kpiActiveCustSub').textContent = `${currentKPIs.activeCustomers.toLocaleString()} Active Purchasing Customers`;
    }

    // Destroy and recreate Chart.js instances safely
    function createOrUpdateChart(canvasId, config) {
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }
        const ctx = document.getElementById(canvasId);
        if (ctx) {
            chartInstances[canvasId] = new Chart(ctx, config);
        }
    }

    // Render All Charts
    function renderCharts() {
        // 1. Monthly Revenue & Profit Trend (Tab Overview)
        const months = monthlyTrends.map(t => t.month);
        const netRevs = monthlyTrends.map(t => t.netRevenue);
        const margins = monthlyTrends.map(t => t.marginPct);

        createOrUpdateChart('chartMonthlyTrend', {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Net Revenue ($)',
                        data: netRevs,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        fill: true,
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Profit Margin (%)',
                        data: margins,
                        borderColor: '#10b981',
                        borderDash: [5, 5],
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#94a3b8', callback: v => `$${v / 1000}k` },
                        grid: { color: '#334155' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#10b981', callback: v => `${v}%` },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        // 2. Category Revenue Donut Chart
        const catLabels = productAnalytics.categorySummary.map(c => c.category);
        const catRevs = productAnalytics.categorySummary.map(c => c.netRevenue);

        createOrUpdateChart('chartCategoryDonut', {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catRevs,
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: '#94a3b8' } }
                }
            }
        });

        // 3. Regional Bar Chart (Tab Overview)
        const regNames = regionalAnalytics.map(r => r.region);
        const regRevs = regionalAnalytics.map(r => r.netRevenue);

        createOrUpdateChart('chartRegionalBar', {
            type: 'bar',
            data: {
                labels: regNames,
                datasets: [{
                    label: 'Net Revenue ($)',
                    data: regRevs,
                    backgroundColor: '#06b6d4',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', callback: v => `$${v / 1000}k` }, grid: { color: '#334155' } }
                }
            }
        });

        // 4. RFM Behavioral Segments Chart (Tab Customers)
        const rfmSummary = rfmData.segmentSummary;
        const rfmLabels = Object.keys(rfmSummary);
        const rfmCounts = rfmLabels.map(k => rfmSummary[k].count);

        createOrUpdateChart('chartRFMSegments', {
            type: 'polarArea',
            data: {
                labels: rfmLabels,
                datasets: [{
                    data: rfmCounts,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)', // Champions
                        'rgba(99, 102, 241, 0.7)', // Loyal Customers
                        'rgba(6, 182, 212, 0.7)',  // Potential Loyalists
                        'rgba(139, 92, 246, 0.7)', // New Customers
                        'rgba(245, 158, 11, 0.7)', // At-Risk VIPs
                        'rgba(239, 68, 68, 0.7)',  // Hibernating
                        'rgba(100, 116, 139, 0.7)' // Needs Attention
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } },
                scales: { r: { ticks: { display: false }, grid: { color: '#334155' } } }
            }
        });

        // 5. Pareto 80/20 Product Chart (Tab Products)
        const topProds = productAnalytics.topProducts.slice(0, 15);
        const prodNames = topProds.map(p => p.product_id);
        const prodRevs = topProds.map(p => p.netRevenue);
        const paretoCum = topProds.map(p => p.cumulativePct);

        createOrUpdateChart('chartPareto', {
            type: 'bar',
            data: {
                labels: prodNames,
                datasets: [
                    {
                        type: 'line',
                        label: 'Cumulative Revenue %',
                        data: paretoCum,
                        borderColor: '#f59e0b',
                        borderWidth: 2,
                        yAxisID: 'y1'
                    },
                    {
                        type: 'bar',
                        label: 'Net Revenue ($)',
                        data: prodRevs,
                        backgroundColor: '#6366f1',
                        borderRadius: 4,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', callback: v => `$${v}` }, grid: { color: '#334155' } },
                    y1: {
                        position: 'right',
                        max: 100,
                        ticks: { color: '#f59e0b', callback: v => `${v}%` },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        // 6. Category Profit Margin vs Refund Rate Chart (Tab Products)
        const catList = productAnalytics.categorySummary;
        createOrUpdateChart('chartCategoryMarginRefund', {
            type: 'bar',
            data: {
                labels: catList.map(c => c.category),
                datasets: [
                    {
                        label: 'Profit Margin %',
                        data: catList.map(c => c.marginPct),
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        label: 'Refund Rate %',
                        data: catList.map(c => c.refundRate),
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', callback: v => `${v}%` }, grid: { color: '#334155' } }
                }
            }
        });

        // 7. Regional Net Revenue & Profit Comparison (Tab Geography)
        createOrUpdateChart('chartRegionalProfit', {
            type: 'bar',
            data: {
                labels: regionalAnalytics.map(r => r.region),
                datasets: [
                    {
                        label: 'Net Revenue ($)',
                        data: regionalAnalytics.map(r => r.netRevenue),
                        backgroundColor: '#6366f1',
                        borderRadius: 4
                    },
                    {
                        label: 'Gross Profit ($)',
                        data: regionalAnalytics.map(r => r.profit),
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { ticks: { color: '#94a3b8', callback: v => `$${v / 1000}k` }, grid: { color: '#334155' } }
                }
            }
        });
    }

    // Render Dynamic Tables & Summaries
    function renderTables() {
        // 1. Executive Summary Box (Tab Overview)
        const summaryBox = document.getElementById('executiveSummaryBox');
        if (summaryBox && currentKPIs) {
            summaryBox.innerHTML = `
                <div class="summary-item">
                    <h4>💵 Revenue & Cashflow Performance</h4>
                    <p>Generated <strong>$${currentKPIs.grossRevenue.toLocaleString()}</strong> in gross orders, yielding <strong>$${currentKPIs.netRevenue.toLocaleString()}</strong> in net realized sales after discounts and <strong>$${(currentKPIs.grossRevenue - currentKPIs.netRevenue).toLocaleString()}</strong> in refunds.</p>
                </div>
                <div class="summary-item">
                    <h4>📈 Profitability & Unit Economics</h4>
                    <p>Delivered an overall gross profit margin of <strong>${currentKPIs.profitMarginPct}%</strong> ($${currentKPIs.totalProfit.toLocaleString()}) with an Average Order Value (AOV) of <strong>$${currentKPIs.aov.toFixed(2)}</strong>.</p>
                </div>
                <div class="summary-item">
                    <h4>🔁 Customer Loyalty & Retention</h4>
                    <p>Active customer base stands at <strong>${currentKPIs.activeCustomers.toLocaleString()}</strong> buyers with a repeat customer rate of <strong>${currentKPIs.repeatCustomerRate}%</strong>.</p>
                </div>
            `;
        }

        // 2. RFM Segment Table (Tab Customers)
        const rfmTbody = document.querySelector('#rfmSegmentTable tbody');
        if (rfmTbody) {
            const summary = rfmData.segmentSummary;
            rfmTbody.innerHTML = Object.keys(summary).map(segName => {
                const s = summary[segName];
                let actionText = 'Maintain engagement';
                if (segName === 'Champions') actionText = 'VIP Rewards & Early Access';
                else if (segName === 'At-Risk VIPs') actionText = '🚨 Urgent Win-Back Offer';
                else if (segName === 'New Customers') actionText = 'Welcome Email Nurture';
                else if (segName === 'Hibernating') actionText = 'Re-activation Promo';

                return `
                    <tr>
                        <td><strong>${segName}</strong></td>
                        <td>${s.count}</td>
                        <td>$${s.totalSpend.toLocaleString()}</td>
                        <td>$${s.avgSpend}</td>
                        <td><span class="card-badge">${actionText}</span></td>
                    </tr>
                `;
            }).join('');
        }

        // 3. Cohort Retention Heatmap (Tab Customers)
        const cohortTbody = document.querySelector('#cohortHeatmapTable tbody');
        if (cohortTbody) {
            cohortTbody.innerHTML = cohortMatrix.map(c => {
                const cells = c.percentages.map((pct, monthIdx) => {
                    let cellClass = 'cohort-cell-empty';
                    if (monthIdx === 0) cellClass = 'cohort-cell-100';
                    else if (pct >= 30) cellClass = 'cohort-cell-high';
                    else if (pct >= 18) cellClass = 'cohort-cell-mid';
                    else if (pct >= 10) cellClass = 'cohort-cell-low';
                    else if (pct > 0) cellClass = 'cohort-cell-vlow';

                    return `<td class="${cellClass}">${pct > 0 ? pct.toFixed(1) + '%' : '-'}</td>`;
                }).join('');

                return `
                    <tr>
                        <td><strong>${c.cohortMonth}</strong></td>
                        <td><strong>${c.cohortSize}</strong></td>
                        ${cells}
                    </tr>
                `;
            }).join('');
        }

        // 4. High-Value Customer Leaderboard (Tab Customers)
        const custTbody = document.querySelector('#customerLeaderboardTable tbody');
        if (custTbody) {
            const topCusts = rfmData.customerList.slice(0, 15);
            custTbody.innerHTML = topCusts.map(c => {
                let badgeClass = 'badge-secondary';
                if (c.segment === 'Champions') badgeClass = 'badge-success';
                else if (c.segment === 'At-Risk VIPs') badgeClass = 'badge-danger';
                else if (c.segment === 'Loyal Customers') badgeClass = 'badge-primary';

                return `
                    <tr>
                        <td><strong>${c.name}</strong><br><small style="color:var(--text-muted)">${c.customer_id}</small></td>
                        <td>${c.region}</td>
                        <td>${c.recencyDays} days ago</td>
                        <td>${c.frequency} orders</td>
                        <td><strong>$${c.monetary.toLocaleString()}</strong></td>
                        <td>${c.rScore}-${c.fScore}-${c.mScore}</td>
                        <td><span class="card-badge ${badgeClass}">${c.segment}</span></td>
                        <td>${c.favoriteCategory}</td>
                    </tr>
                `;
            }).join('');
        }

        // 5. Product Performance Leaderboard (Tab Products)
        const prodTbody = document.querySelector('#productLeaderboardTable tbody');
        if (prodTbody) {
            const prods = productAnalytics.topProducts.slice(0, 20);
            prodTbody.innerHTML = prods.map(p => `
                <tr>
                    <td><strong>${p.product_id}</strong></td>
                    <td>${p.category}</td>
                    <td>${p.unitsSold}</td>
                    <td>$${p.grossRevenue.toLocaleString()}</td>
                    <td><strong>$${p.netRevenue.toLocaleString()}</strong></td>
                    <td>$${p.profit.toLocaleString()}</td>
                    <td><span class="card-badge ${p.marginPct > 40 ? 'badge-success' : 'badge-warning'}">${p.marginPct}%</span></td>
                    <td><span class="card-badge ${p.refundRate > 10 ? 'badge-danger' : 'badge-secondary'}">${p.refundRate}%</span></td>
                    <td>${p.cumulativePct}%</td>
                </tr>
            `).join('');
        }

        // 6. Regional Directory Table (Tab Geography)
        const regTbody = document.querySelector('#regionalDirectoryTable tbody');
        if (regTbody) {
            regTbody.innerHTML = regionalAnalytics.map(r => `
                <tr>
                    <td><strong>${r.region}</strong></td>
                    <td>$${r.netRevenue.toLocaleString()}</td>
                    <td><span class="card-badge badge-success">${r.marginPct}%</span></td>
                    <td>$${r.aov.toFixed(2)}</td>
                    <td>${r.customerCount}</td>
                    <td>${r.topState}</td>
                </tr>
            `).join('');
        }
    }

    // Render Data Quality Audit Logs
    function renderAuditLogs() {
        const list = document.getElementById('auditLogList');
        const scoreBadge = document.getElementById('auditHealthScore');
        if (!list || !cleanDataset || !cleanDataset.auditReport) return;

        const audit = cleanDataset.auditReport;
        if (scoreBadge) scoreBadge.textContent = `Health Index: ${audit.qualityScore}%`;

        list.innerHTML = audit.logs.map(log => `<li>${log}</li>`).join('');
    }

    // Render Strategic Recommendations
    function renderRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p class="section-desc">All operating metrics are performing within normal parameters.</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="rec-card">
                <div class="rec-header">
                    <span class="rec-title">${rec.title}</span>
                    <span class="card-badge ${rec.badgeClass}">${rec.priority}</span>
                </div>
                <div class="rec-insight">${rec.insight}</div>
                <div class="rec-action">💡 <strong>Actionable Step:</strong> ${rec.actionableStep}</div>
            </div>
        `).join('');
    }

    // Interactive Business What-If Simulator
    function runSimulation() {
        if (!currentKPIs) return;

        const priceVal = parseFloat(document.getElementById('sliderPrice').value);
        const refundVal = parseFloat(document.getElementById('sliderRefund').value);
        const retentionVal = parseFloat(document.getElementById('sliderRetention').value);

        document.getElementById('valSliderPrice').textContent = `${priceVal > 0 ? '+' : ''}${priceVal}%`;
        document.getElementById('valSliderRefund').textContent = `${refundVal}%`;
        document.getElementById('valSliderRetention').textContent = `+${retentionVal}%`;

        const simResult = DataEngine.simulateBusinessScenario(currentKPIs, {
            priceChangePct: priceVal,
            refundReductionPct: refundVal,
            retentionBoostPct: retentionVal
        });

        document.getElementById('simProjNetRev').textContent = `$${simResult.projectedNetRevenue.toLocaleString()}`;
        document.getElementById('simDiffNetRev').textContent = `${simResult.netRevenueLift >= 0 ? '+' : ''}$${simResult.netRevenueLift.toLocaleString()}`;

        document.getElementById('simProjProfit').textContent = `$${simResult.projectedProfit.toLocaleString()}`;
        document.getElementById('simDiffProfit').textContent = `${simResult.profitLift >= 0 ? '+' : ''}$${simResult.profitLift.toLocaleString()}`;

        document.getElementById('simProjMargin').textContent = `${simResult.projectedMarginPct}%`;
        document.getElementById('simDiffMargin').textContent = `${simResult.marginPctLift >= 0 ? '+' : ''}${simResult.marginPctLift.toFixed(1)}%`;
    }

    // Switch Tab Pane Navigation
    function switchTab(tabPaneId, btnElement) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

        if (btnElement) btnElement.classList.add('active');
        const targetPane = document.getElementById(tabPaneId);
        if (targetPane) targetPane.classList.add('active');

        // Trigger chart resize update
        setTimeout(() => {
            Object.values(chartInstances).forEach(chart => {
                if (chart) chart.resize();
            });
        }, 50);
    }

    // Modal Control Functions
    function openUploadModal() {
        document.getElementById('uploadModal').classList.add('active');
    }

    function closeUploadModal() {
        document.getElementById('uploadModal').classList.remove('active');
    }

    // Handle File Upload (PapaParse)
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    console.log(`[CSV Upload] Parsed ${results.data.length} rows successfully.`);
                    
                    // Simple wrapper to convert uploaded CSV into internal order line items format
                    const parsedItems = results.data.map((row, idx) => ({
                        item_id: row.item_id || `CSV-${idx + 1}`,
                        order_id: String(row.order_id || `ORD-CSV-${idx + 1}`),
                        customer_id: String(row.customer_id || `CUST-CSV-${(idx % 50) + 1}`),
                        product_id: String(row.product_id || `PROD-CSV-${(idx % 20) + 1}`),
                        category: row.category || 'Electronics',
                        quantity: Number(row.quantity || 1),
                        unit_price: Number(row.unit_price || row.gross_amount || 49.99),
                        unit_cost: Number(row.unit_cost || (row.unit_price ? row.unit_price * 0.5 : 25.00)),
                        discount_pct: Number(row.discount_pct || 0),
                        discount_amount: Number(row.discount_amount || 0),
                        gross_amount: Number(row.gross_amount || row.unit_price || 49.99),
                        net_amount: Number(row.net_amount || row.gross_amount || 49.99),
                        total_cost: Number(row.total_cost || 25.00),
                        gross_profit: Number(row.gross_profit || (row.net_amount ? row.net_amount - 25.00 : 24.99)),
                        order_status: row.order_status || 'Completed',
                        refund_amount: Number(row.refund_amount || 0),
                        order_date: row.order_date || '2025-01-15',
                        order_month: (row.order_date || '2025-01-15').substring(0, 7),
                        region: row.region || 'North America',
                        state: row.state || 'California',
                        country: row.country || 'USA / Canada',
                        ship_mode: row.ship_mode || 'Standard Class',
                        payment_method: row.payment_method || 'Credit Card'
                    }));

                    cleanDataset.cleanOrderItems = parsedItems;
                    applyFilters();
                    closeUploadModal();
                    alert(`Successfully imported ${parsedItems.length} records into dashboard!`);
                }
            },
            error: function(err) {
                alert('Error parsing CSV file: ' + err.message);
            }
        });
    }

    // Export Filtered Dataset to CSV
    function exportReportCSV() {
        if (!filteredOrderItems || filteredOrderItems.length === 0) return;

        const csvString = Papa.unparse(filteredOrderItems);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Ecommerce_Sales_Insights_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Print Executive Summary
    function printExecutiveSummary() {
        window.print();
    }

    // Run init on DOM load
    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        applyFilters,
        resetFilters,
        switchTab,
        runSimulation,
        openUploadModal,
        closeUploadModal,
        handleFileUpload,
        exportReportCSV,
        printExecutiveSummary
    };
})();
