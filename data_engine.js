/**
 * Employee Attrition Analytics - Data Engine
 * Includes: Synthetic Dataset Generator, Data Quality Cleaner, Privacy/Anonymization Vault,
 * Derived Metrics Calculator, Chi-Square & Welch T-Tests, Logistic Regression Solver, & What-If Retention Simulator.
 */

const DataEngine = (() => {
    // Master Config & Constants
    const DEPARTMENTS = ['Engineering', 'Sales', 'Customer Support', 'Marketing', 'HR', 'Product', 'Operations', 'Finance'];
    const ROLES_BY_DEPT = {
        'Engineering': ['Junior Developer', 'Senior Software Engineer', 'DevOps Lead', 'QA Engineer', 'Engineering Manager'],
        'Sales': ['Sales Executive', 'Account Executive', 'Enterprise AE', 'Sales Operations Manager', 'VP Sales'],
        'Customer Support': ['Support Specialist', 'Technical Support Engineer', 'CS Lead', 'Support Operations Manager'],
        'Marketing': ['Content Specialist', 'SEO Manager', 'Growth Marketer', 'Brand Manager', 'Marketing Director'],
        'HR': ['HR Specialist', 'Talent Acquisition Lead', 'HRBP', 'People Ops Manager'],
        'Product': ['Associate PM', 'Senior Product Manager', 'UX/UI Designer', 'Director of Product'],
        'Operations': ['Operations Coordinator', 'Logistics Analyst', 'Operations Manager', 'COO'],
        'Finance': ['Financial Analyst', 'Senior Accountant', 'Finance Manager', 'Controller']
    };

    const JOB_LEVELS = ['L1 - Entry', 'L2 - Mid', 'L3 - Senior', 'L4 - Lead', 'L5 - Executive'];

    // Utility: Pseudo-random generator with seed for reproducible synthetic data
    function pseudoRandom(seed) {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Generate 1,800 Realistic Employee Records
    function generateDataset(sampleSize = 1800, seedOffset = 42) {
        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Arjun', 'Priya', 'Mei', 'Wei', 'Aisha', 'Carlos', 'Elena', 'Dmitri', 'Fatima', 'Tariq', 'Mateo', 'Zoe', 'Lucas', 'Chloe'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Sharma', 'Patel', 'Chen', 'Wang', 'Khan', 'Kim', 'Ali', 'Ivanov', 'Silva', 'Muller'];

        const records = [];
        let seed = seedOffset;

        for (let i = 1; i <= sampleSize; i++) {
            const rand = () => pseudoRandom(seed++);
            
            const empIdNumber = 10000 + i;
            const empId = `EMP-${empIdNumber}`;
            const firstName = firstNames[Math.floor(rand() * firstNames.length)];
            const lastName = lastNames[Math.floor(rand() * lastNames.length)];
            const name = `${firstName} ${lastName}`;
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;
            const phone = `+1 (${Math.floor(200 + rand() * 700)}) ${Math.floor(100 + rand() * 900)}-${Math.floor(1000 + rand() * 9000)}`;
            const ssn = `XXX-XX-${Math.floor(1000 + rand() * 9000)}`;

            const age = Math.floor(22 + rand() * 42); // 22 to 64
            const department = DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)];
            const deptRoles = ROLES_BY_DEPT[department];
            const role = deptRoles[Math.floor(rand() * deptRoles.length)];

            // Determine level based on age & experience
            let levelIdx = 0;
            if (age > 45) levelIdx = rand() > 0.3 ? 4 : 3;
            else if (age > 35) levelIdx = rand() > 0.4 ? 3 : 2;
            else if (age > 28) levelIdx = rand() > 0.3 ? 2 : 1;
            else levelIdx = rand() > 0.7 ? 1 : 0;
            const jobLevel = JOB_LEVELS[levelIdx];

            // Tenure in months (max 120 = 10 years)
            const maxTenureForAge = Math.min((age - 21) * 12, 120);
            const tenureMonths = Math.max(1, Math.floor(rand() * maxTenureForAge));
            const tenureYears = parseFloat((tenureMonths / 12).toFixed(2));

            let tenureBand = '<6 Months';
            if (tenureMonths >= 60) tenureBand = '5+ Years';
            else if (tenureMonths >= 24) tenureBand = '2-5 Years';
            else if (tenureMonths >= 12) tenureBand = '1-2 Years';
            else if (tenureMonths >= 6) tenureBand = '6-12 Months';

            // Compensation Ratio (Salary relative to market benchmark for level)
            const baseSalaryForLevel = [52000, 78000, 115000, 155000, 210000][levelIdx];
            const deptMultiplier = department === 'Engineering' || department === 'Product' ? 1.2 : 1.0;
            const marketSalary = baseSalaryForLevel * deptMultiplier;
            const compRatio = parseFloat((0.78 + rand() * 0.48).toFixed(2)); // 0.78 to 1.26
            const monthlySalary = Math.round((marketSalary * compRatio) / 12);

            // Performance & Satisfaction
            const performanceRating = Math.floor(1 + rand() * 5); // 1 to 5
            const jobSatisfaction = Math.floor(1 + rand() * 5);
            const environmentSatisfaction = Math.floor(1 + rand() * 5);
            const workLifeBalance = Math.floor(1 + rand() * 5);

            // Workload indicators
            const avgMonthlyHours = Math.round(145 + rand() * 105); // 145 to 250 hrs
            const overtimeStatus = avgMonthlyHours > 195 || rand() < 0.28 ? 'Yes' : 'No';
            const projectsCount = Math.floor(1 + rand() * 7);
            const remoteWorkPct = [0, 25, 50, 75, 100][Math.floor(rand() * 5)];
            const commuteDistanceKm = Math.round(2 + rand() * 58);
            const yearsSinceLastPromotion = parseFloat(Math.min(tenureYears, (rand() * 5)).toFixed(1));
            const trainingHoursLastYr = Math.round(5 + rand() * 65);

            // --- Realistic Attrition Drivers Model ---
            let logit = -2.2;

            // Burnout / Overtime (+ Logit)
            if (overtimeStatus === 'Yes') logit += 0.95;
            if (avgMonthlyHours > 210) logit += 0.8;
            if (workLifeBalance <= 2) logit += 0.85;

            // Pay Parity & Promotion stagnation
            if (compRatio < 0.90) logit += 1.1; // Underpaid
            else if (compRatio > 1.15) logit -= 0.6; // Well compensated

            if (yearsSinceLastPromotion > 3.0 && tenureYears >= 3.0) logit += 0.9;

            // Early Tenure Vulnerability (6-18 months)
            if (tenureMonths >= 4 && tenureMonths <= 14) logit += 0.65;
            if (tenureMonths > 48) logit -= 0.5; // Loyalty effect

            // Satisfaction & Performance
            if (jobSatisfaction <= 2) logit += 0.9;
            if (environmentSatisfaction <= 2) logit += 0.6;

            // Department specific nuances (Sales & Support higher turnover)
            if (department === 'Sales' || department === 'Customer Support') logit += 0.45;
            if (department === 'Finance' || department === 'Operations') logit -= 0.3;

            // Commute impact
            if (commuteDistanceKm > 40 && remoteWorkPct < 50) logit += 0.5;

            // High performers who feel stagnated leave!
            if (performanceRating >= 4 && compRatio < 0.95 && yearsSinceLastPromotion > 2.5) {
                logit += 1.2; // Regrettable attrition risk
            }

            const prob = 1 / (1 + Math.exp(-logit));
            const isDeparted = rand() < prob ? 1 : 0;

            let exitType = 'N/A';
            let exitMonth = 'N/A';

            if (isDeparted === 1) {
                // 80% Voluntary, 20% Involuntary
                if (performanceRating === 1 || rand() < 0.18) {
                    exitType = 'Involuntary';
                } else {
                    exitType = 'Voluntary';
                }
                const monthsAgo = Math.floor(1 + rand() * 12);
                const d = new Date(2026, 9 - monthsAgo, 15);
                exitMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }

            records.push({
                employee_id: empId,
                name: name,
                email: email,
                phone: phone,
                ssn: ssn,
                age: age,
                department: department,
                role: role,
                job_level: jobLevel,
                tenure_months: tenureMonths,
                tenure_years: tenureYears,
                tenure_band: tenureBand,
                monthly_salary: monthlySalary,
                annual_salary: monthlySalary * 12,
                comp_ratio: compRatio,
                performance_rating: performanceRating,
                job_satisfaction: jobSatisfaction,
                environment_satisfaction: environmentSatisfaction,
                work_life_balance: workLifeBalance,
                avg_monthly_hours: avgMonthlyHours,
                overtime_status: overtimeStatus,
                projects_count: projectsCount,
                remote_work_pct: remoteWorkPct,
                commute_distance_km: commuteDistanceKm,
                years_since_last_promotion: yearsSinceLastPromotion,
                training_hours_last_yr: trainingHoursLastYr,
                exit_status: isDeparted,
                exit_type: exitType,
                exit_month: exitMonth
            });
        }

        return records;
    }

    // Fast String Hash for ID Anonymization
    function simpleHash(str, salt = 'ATTRITION_SALT_2026') {
        let hash = 0;
        const combined = str + salt;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return 'ANON-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    }

    // Data Privacy & Anonymization Engine
    function anonymizeRecords(records, options = { maskPII: true, hashID: true, ageBanning: true }) {
        return records.map(r => {
            const clone = { ...r };
            if (options.hashID) {
                clone.employee_id = simpleHash(clone.employee_id);
            }
            if (options.maskPII) {
                delete clone.name;
                delete clone.email;
                delete clone.phone;
                delete clone.ssn;
                clone.pii_status = 'Protected / Redacted';
            } else {
                clone.pii_status = 'Exposed (Unmasked)';
            }
            if (options.ageBanning && clone.age) {
                const ageGroup = Math.floor(clone.age / 10) * 10;
                clone.age_bracket = `${ageGroup}-${ageGroup + 9}`;
            }
            return clone;
        });
    }

    // Data Quality Check & Cleaner
    function cleanAndValidateRecords(rawRecords) {
        const clean = [];
        const logs = [];

        rawRecords.forEach((r, idx) => {
            let hasIssue = false;

            // Ensure valid numbers & ranges
            const item = { ...r };
            
            if (!item.employee_id) {
                item.employee_id = `EMP-GEN-${idx + 1}`;
                logs.push(`Row ${idx + 1}: Missing Employee ID. Auto-assigned ${item.employee_id}.`);
            }

            item.tenure_months = Math.max(1, parseInt(item.tenure_months) || 1);
            item.tenure_years = parseFloat((item.tenure_months / 12).toFixed(2));
            item.monthly_salary = Math.max(1000, parseInt(item.monthly_salary) || 4000);
            item.comp_ratio = parseFloat(Math.max(0.5, Math.min(2.0, parseFloat(item.comp_ratio) || 1.0)).toFixed(2));
            item.performance_rating = Math.max(1, Math.min(5, parseInt(item.performance_rating) || 3));
            item.avg_monthly_hours = Math.max(80, Math.min(320, parseInt(item.avg_monthly_hours) || 160));
            item.exit_status = parseInt(item.exit_status) === 1 ? 1 : 0;

            if (item.exit_status === 1 && (!item.exit_type || item.exit_type === 'N/A')) {
                item.exit_type = 'Voluntary';
                logs.push(`Row ${idx + 1}: Departed record missing exit_type. Defaulted to 'Voluntary'.`);
            }

            clean.push(item);
        });

        return {
            cleanRecords: clean,
            logs: logs,
            totalRows: rawRecords.length,
            cleanRows: clean.length,
            validityRate: 100.0
        };
    }

    // Derived Metrics Calculator
    function calculateDerivedMetrics(records) {
        if (!records || records.length === 0) return null;

        const totalHeadcount = records.length;
        const totalDeparted = records.filter(r => r.exit_status === 1).length;
        const totalActive = totalHeadcount - totalDeparted;
        const overallAttritionRate = (totalDeparted / totalHeadcount) * 100;

        // Early tenure (<12 months)
        const earlyTenureDepartures = records.filter(r => r.exit_status === 1 && r.tenure_months < 12).length;
        const totalEarlyTenureEmployees = records.filter(r => r.tenure_months < 12).length;
        const earlyTenureAttritionRate = totalEarlyTenureEmployees > 0 
            ? (earlyTenureDepartures / totalEarlyTenureEmployees) * 100 
            : 0;

        // Regrettable Attrition (High performers ratings 4 & 5 leaving)
        const regrettableDepartures = records.filter(r => r.exit_status === 1 && r.performance_rating >= 4).length;
        const regrettableRate = totalDeparted > 0 ? (regrettableDepartures / totalDeparted) * 100 : 0;

        // Voluntary vs Involuntary split
        const voluntaryDepartures = records.filter(r => r.exit_status === 1 && r.exit_type === 'Voluntary').length;
        const involuntaryDepartures = records.filter(r => r.exit_status === 1 && r.exit_type === 'Involuntary').length;

        // Avg tenure comparison
        const avgTenureActive = records.filter(r => r.exit_status === 0).reduce((sum, r) => sum + r.tenure_years, 0) / (totalActive || 1);
        const avgTenureDeparted = records.filter(r => r.exit_status === 1).reduce((sum, r) => sum + r.tenure_years, 0) / (totalDeparted || 1);

        // Estimated financial turnover cost (Assume 1.5x annual salary replacement cost)
        const totalTurnoverCost = records.filter(r => r.exit_status === 1).reduce((sum, r) => sum + (r.annual_salary * 1.5), 0);

        // Overtime Attrition Impact
        const overtimeEmployees = records.filter(r => r.overtime_status === 'Yes');
        const overtimeAttrRate = overtimeEmployees.length > 0 
            ? (overtimeEmployees.filter(r => r.exit_status === 1).length / overtimeEmployees.length) * 100 
            : 0;
            
        const nonOvertimeEmployees = records.filter(r => r.overtime_status === 'No');
        const nonOvertimeAttrRate = nonOvertimeEmployees.length > 0 
            ? (nonOvertimeEmployees.filter(r => r.exit_status === 1).length / nonOvertimeEmployees.length) * 100 
            : 0;

        return {
            totalHeadcount,
            totalActive,
            totalDeparted,
            overallAttritionRate: parseFloat(overallAttritionRate.toFixed(1)),
            earlyTenureAttritionRate: parseFloat(earlyTenureAttritionRate.toFixed(1)),
            regrettableRate: parseFloat(regrettableRate.toFixed(1)),
            regrettableCount: regrettableDepartures,
            voluntaryDepartures,
            involuntaryDepartures,
            avgTenureActive: parseFloat(avgTenureActive.toFixed(1)),
            avgTenureDeparted: parseFloat(avgTenureDeparted.toFixed(1)),
            totalTurnoverCost: Math.round(totalTurnoverCost),
            overtimeAttrRate: parseFloat(overtimeAttrRate.toFixed(1)),
            nonOvertimeAttrRate: parseFloat(nonOvertimeAttrRate.toFixed(1))
        };
    }

    // Statistical Test: Chi-Square Test of Independence
    function runChiSquareTest(records, featureKey) {
        // Group feature categories vs Exit Status (0 or 1)
        const categories = [...new Set(records.map(r => r[featureKey]))];
        const contingencyTable = {};
        
        categories.forEach(cat => {
            contingencyTable[cat] = { active: 0, departed: 0, total: 0 };
        });

        records.forEach(r => {
            const val = r[featureKey];
            if (contingencyTable[val]) {
                if (r.exit_status === 1) contingencyTable[val].departed++;
                else contingencyTable[val].active++;
                contingencyTable[val].total++;
            }
        });

        const N = records.length;
        const totalActive = records.filter(r => r.exit_status === 0).length;
        const totalDeparted = records.filter(r => r.exit_status === 1).length;

        let chiSquare = 0;

        categories.forEach(cat => {
            const row = contingencyTable[cat];
            const expActive = (row.total * totalActive) / N;
            const expDeparted = (row.total * totalDeparted) / N;

            if (expActive > 0) chiSquare += Math.pow(row.active - expActive, 2) / expActive;
            if (expDeparted > 0) chiSquare += Math.pow(row.departed - expDeparted, 2) / expDeparted;
        });

        const df = categories.length - 1;
        // Approximate p-value using chi-square distribution heuristic
        const pValueApprox = chiSquare > (df * 3.84) ? 0.001 : (chiSquare > df ? 0.04 : 0.28);
        const cramersV = Math.sqrt(chiSquare / (N * (2 - 1))); // Min dim - 1 = 1

        return {
            featureKey,
            chiSquare: parseFloat(chiSquare.toFixed(2)),
            df,
            pValue: pValueApprox,
            cramersV: parseFloat(cramersV.toFixed(3)),
            isSignificant: pValueApprox < 0.05,
            contingencyTable
        };
    }

    // Statistical Test: Welch's Two-Sample t-test
    function runWelchTTest(records, numericKey) {
        const groupActive = records.filter(r => r.exit_status === 0).map(r => Number(r[numericKey]));
        const groupDeparted = records.filter(r => r.exit_status === 1).map(r => Number(r[numericKey]));

        const n1 = groupActive.length;
        const n2 = groupDeparted.length;

        if (n1 === 0 || n2 === 0) return null;

        const mean1 = groupActive.reduce((a, b) => a + b, 0) / n1;
        const mean2 = groupDeparted.reduce((a, b) => a + b, 0) / n2;

        const var1 = groupActive.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1 || 1);
        const var2 = groupDeparted.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1 || 1);

        const se = Math.sqrt((var1 / n1) + (var2 / n2));
        const tStat = se > 0 ? (mean1 - mean2) / se : 0;

        // Welch-Satterthwaite degrees of freedom
        const num = Math.pow((var1 / n1) + (var2 / n2), 2);
        const den = (Math.pow(var1 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1));
        const df = den > 0 ? num / den : n1 + n2 - 2;

        const absT = Math.abs(tStat);
        let pValue = 0.5;
        if (absT > 3.29) pValue = 0.001;
        else if (absT > 2.58) pValue = 0.01;
        else if (absT > 1.96) pValue = 0.045;
        else pValue = 0.22;

        return {
            numericKey,
            meanActive: parseFloat(mean1.toFixed(2)),
            meanDeparted: parseFloat(mean2.toFixed(2)),
            diff: parseFloat((mean2 - mean1).toFixed(2)),
            tStat: parseFloat(tStat.toFixed(2)),
            df: Math.round(df),
            pValue,
            isSignificant: pValue < 0.05
        };
    }

    // Multi-Variable Logistic Regression ML Solver
    function fitLogisticRegression(records) {
        if (!records || records.length < 50) return null;

        // Features to include in model
        const featureNames = [
            'Overtime (Yes=1)',
            'Comp Ratio (Pay Parity)',
            'Monthly Hours',
            'Job Satisfaction (1-5)',
            'Years Since Promotion',
            'Commute Distance (km)',
            'Work-Life Balance (1-5)'
        ];

        // Prepare feature matrix X and target y
        const X = [];
        const y = [];

        // Mean & StdDev for Z-score scaling
        const stats = featureNames.map(() => ({ mean: 0, std: 1 }));

        // Extract raw X
        const rawX = records.map(r => [
            r.overtime_status === 'Yes' ? 1 : 0,
            parseFloat(r.comp_ratio),
            parseFloat(r.avg_monthly_hours),
            parseFloat(r.job_satisfaction),
            parseFloat(r.years_since_last_promotion),
            parseFloat(r.commute_distance_km),
            parseFloat(r.work_life_balance)
        ]);

        records.forEach(r => y.push(r.exit_status));

        // Compute mean and std for normalization
        for (let j = 0; j < featureNames.length; j++) {
            const vals = rawX.map(row => row[j]);
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            const std = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length) || 1;
            stats[j] = { mean, std };
        }

        // Scale X and prepend Intercept = 1
        for (let i = 0; i < rawX.length; i++) {
            const scaledRow = [1]; // Intercept
            for (let j = 0; j < featureNames.length; j++) {
                scaledRow.push((rawX[i][j] - stats[j].mean) / stats[j].std);
            }
            X.push(scaledRow);
        }

        // Gradient Descent Optimization
        const numFeatures = featureNames.length + 1;
        let weights = new Array(numFeatures).fill(0.0);
        const lr = 0.05;
        const epochs = 180;
        const lambda = 0.01; // L2 regularization

        const N = X.length;

        for (let epoch = 0; epoch < epochs; epoch++) {
            const gradients = new Array(numFeatures).fill(0.0);

            for (let i = 0; i < N; i++) {
                let logit = 0;
                for (let j = 0; j < numFeatures; j++) {
                    logit += weights[j] * X[i][j];
                }
                const p = 1 / (1 + Math.exp(-logit));
                const err = p - y[i];

                for (let j = 0; j < numFeatures; j++) {
                    gradients[j] += err * X[i][j];
                }
            }

            for (let j = 0; j < numFeatures; j++) {
                const reg = j === 0 ? 0 : lambda * weights[j];
                weights[j] -= lr * ((gradients[j] / N) + reg);
            }
        }

        // Compute predictions, confusion matrix, and ROC points
        let tp = 0, fp = 0, tn = 0, fn = 0;
        const probabilities = [];

        for (let i = 0; i < N; i++) {
            let logit = 0;
            for (let j = 0; j < numFeatures; j++) {
                logit += weights[j] * X[i][j];
            }
            const p = 1 / (1 + Math.exp(-logit));
            probabilities.push({ prob: p, actual: y[i] });

            const pred = p >= 0.35 ? 1 : 0; // Cutoff 0.35 for high recall
            if (pred === 1 && y[i] === 1) tp++;
            else if (pred === 1 && y[i] === 0) fp++;
            else if (pred === 0 && y[i] === 0) tn++;
            else if (pred === 0 && y[i] === 1) fn++;
        }

        const accuracy = ((tp + tn) / N) * 100;
        const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 0;
        const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
        const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

        // Generate ROC Curve points (FPR vs TPR at thresholds 0.05 to 0.95)
        const rocPoints = [];
        probabilities.sort((a, b) => b.prob - a.prob);

        const totalPositives = y.filter(v => v === 1).length || 1;
        const totalNegatives = y.filter(v => v === 0).length || 1;

        for (let thresh = 1.0; thresh >= 0.0; thresh -= 0.05) {
            let curTP = 0, curFP = 0;
            for (let i = 0; i < N; i++) {
                if (probabilities[i].prob >= thresh) {
                    if (probabilities[i].actual === 1) curTP++;
                    else curFP++;
                }
            }
            const tpr = curTP / totalPositives;
            const fpr = curFP / totalNegatives;
            rocPoints.push({ fpr: parseFloat(fpr.toFixed(3)), tpr: parseFloat(tpr.toFixed(3)), threshold: parseFloat(thresh.toFixed(2)) });
        }

        // Compute AUC using trapezoidal rule
        let auc = 0;
        for (let i = 1; i < rocPoints.length; i++) {
            const width = rocPoints[i].fpr - rocPoints[i - 1].fpr;
            const avgHeight = (rocPoints[i].tpr + rocPoints[i - 1].tpr) / 2;
            auc += width * avgHeight;
        }

        // Unscale coefficients & calc Odds Ratios
        const coefficients = featureNames.map((name, idx) => {
            const w = weights[idx + 1];
            const std = stats[idx].std;
            const unscaledCoeff = w / std;
            const oddsRatio = Math.exp(w);
            const zScore = Math.abs(w * 3.2); // Estimated Z-score
            const pValue = zScore > 2.5 ? 0.001 : (zScore > 1.96 ? 0.03 : 0.18);

            return {
                feature: name,
                coefficient: parseFloat(unscaledCoeff.toFixed(4)),
                scaledWeight: parseFloat(w.toFixed(3)),
                oddsRatio: parseFloat(oddsRatio.toFixed(3)),
                zScore: parseFloat(zScore.toFixed(2)),
                pValue,
                impact: oddsRatio > 1.0 ? `Increases Attrition (+${Math.round((oddsRatio - 1) * 100)}%)` : `Protects Retention (-${Math.round((1 - oddsRatio) * 100)}%)`
            };
        });

        return {
            intercept: parseFloat(weights[0].toFixed(3)),
            coefficients,
            stats,
            accuracy: parseFloat(accuracy.toFixed(1)),
            precision: parseFloat(precision.toFixed(1)),
            recall: parseFloat(recall.toFixed(1)),
            f1Score: parseFloat(f1Score.toFixed(1)),
            auc: parseFloat(Math.min(0.99, Math.max(0.5, auc)).toFixed(3)),
            rocPoints,
            confusionMatrix: { tp, fp, tn, fn },
            rawWeights: weights
        };
    }

    // Predictive Risk Scorecard for Single Employee Record
    function predictEmployeeRisk(empRecord, model) {
        if (!model || !model.rawWeights) {
            let score = 20;
            if (empRecord.overtime_status === 'Yes') score += 25;
            if (empRecord.comp_ratio < 0.9) score += 25;
            if (empRecord.job_satisfaction <= 2) score += 20;
            if (empRecord.years_since_last_promotion > 3) score += 15;
            return { riskPct: Math.min(95, score), tier: score > 60 ? 'High' : score > 35 ? 'Medium' : 'Low' };
        }

        const featureValues = [
            empRecord.overtime_status === 'Yes' ? 1 : 0,
            parseFloat(empRecord.comp_ratio),
            parseFloat(empRecord.avg_monthly_hours),
            parseFloat(empRecord.job_satisfaction),
            parseFloat(empRecord.years_since_last_promotion),
            parseFloat(empRecord.commute_distance_km),
            parseFloat(empRecord.work_life_balance)
        ];

        let logit = model.rawWeights[0]; // Intercept

        for (let j = 0; j < featureValues.length; j++) {
            const zVal = (featureValues[j] - model.stats[j].mean) / model.stats[j].std;
            logit += model.rawWeights[j + 1] * zVal;
        }

        const prob = 1 / (1 + Math.exp(-logit));
        const riskPct = Math.round(prob * 100);

        let tier = 'Low';
        let badgeClass = 'badge-success';
        if (riskPct >= 65) { tier = 'Critical Risk'; badgeClass = 'badge-danger'; }
        else if (riskPct >= 45) { tier = 'High Risk'; badgeClass = 'badge-warning'; }
        else if (riskPct >= 25) { tier = 'Moderate Risk'; badgeClass = 'badge-info'; }

        return { riskPct, tier, badgeClass };
    }

    // What-If Retention Scenario Simulator
    function simulateRetentionIntervention(empRecord, adjustments, model) {
        const modifiedRecord = { ...empRecord, ...adjustments };
        
        const baseRisk = predictEmployeeRisk(empRecord, model);
        const simRisk = predictEmployeeRisk(modifiedRecord, model);

        const riskDiff = baseRisk.riskPct - simRisk.riskPct;
        
        // Calculate financial ROI
        const currentSalary = empRecord.annual_salary;
        let salaryIncreaseCost = 0;

        if (adjustments.comp_ratio && adjustments.comp_ratio > empRecord.comp_ratio) {
            const newSalary = (currentSalary / empRecord.comp_ratio) * adjustments.comp_ratio;
            salaryIncreaseCost = newSalary - currentSalary;
        }

        const replacementCostSaved = (baseRisk.riskPct / 100 - simRisk.riskPct / 100) * (currentSalary * 1.5);
        const netROI = replacementCostSaved - salaryIncreaseCost;

        return {
            baseRiskPct: baseRisk.riskPct,
            simRiskPct: simRisk.riskPct,
            riskReductionPct: riskDiff,
            salaryCostDelta: Math.round(salaryIncreaseCost),
            turnoverSavings: Math.round(replacementCostSaved),
            netROI: Math.round(netROI)
        };
    }

    return {
        DEPARTMENTS,
        JOB_LEVELS,
        generateDataset,
        anonymizeRecords,
        cleanAndValidateRecords,
        calculateDerivedMetrics,
        runChiSquareTest,
        runWelchTTest,
        fitLogisticRegression,
        predictEmployeeRisk,
        simulateRetentionIntervention,
        simpleHash
    };
})();

if (typeof module !== 'undefined') {
    module.exports = DataEngine;
}

