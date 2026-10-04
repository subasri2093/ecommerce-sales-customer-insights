/**
 * E-commerce Sales & Customer Insights Analytics - Data Engine
 * Features:
 * 1. Multi-Relational Data Generator (Customers, Products, Orders, Locations, Order Line Items)
 * 2. Automated Data Quality Cleaner & Normalizer (Deduplication, Missing Values, Refund Harmonization, Category Normalization)
 * 3. Unified Relational Merging & Feature Engineering
 * 4. Advanced Metrics Calculator (Net/Gross Revenue, AOV, Profit Margin %, Repeat Customer Rate, CLV)
 * 5. Monthly & Quarterly Trend Analysis Engine
 * 6. Customer Acquisition Cohort Analysis (12-Month Retention Matrix)
 * 7. Customer Behavioral & RFM (Recency, Frequency, Monetary) Segmentation Engine
 * 8. Product Leaderboard, Pareto (80/20) Analysis & Underperforming Category Hotspots
 * 9. Regional & Geography Pattern Aggregations
 * 10. Automated Data-Backed Strategic Recommendations Generator
 * 11. What-If Business Scenario Simulator (Pricing, Refund Reduction, Retention Lift)
 */

const DataEngine = (() => {
    // Master Categories & Inconsistent Typo Mapping for Data Cleaning Demonstration
    const CATEGORIES = ['Electronics', 'Apparel & Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Outdoors', 'Books & Media', 'Office Supplies'];
    
    // Dirty category dictionary for synthetic dirty data generation & cleaning demonstration
    const DIRTY_CATEGORY_MAP = {
        'electronics': 'Electronics',
        'Electrnoics': 'Electronics',
        'ELECTRONICS': 'Electronics',
        'apparel': 'Apparel & Fashion',
        'Apparel': 'Apparel & Fashion',
        'apparel & fashion': 'Apparel & Fashion',
        'Home & kitchen': 'Home & Kitchen',
        'home & kitchen': 'Home & Kitchen',
        'Beauty': 'Beauty & Personal Care',
        'beauty & personal care': 'Beauty & Personal Care',
        'sports': 'Sports & Outdoors',
        'Sports': 'Sports & Outdoors',
        'Books': 'Books & Media',
        'office supplies': 'Office Supplies'
    };

    const REGIONS = [
        { name: 'North America', states: ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Ontario'], country: 'USA / Canada' },
        { name: 'Europe', states: ['London Region', 'Bavaria', 'Île-de-France', 'Catalonia', 'Lombardy'], country: 'UK / Germany / France' },
        { name: 'Asia-Pacific', states: ['Tokyo Prefecture', 'Singapore Region', 'New South Wales', 'Maharashtra'], country: 'Japan / Australia / India' },
        { name: 'Latin America', states: ['São Paulo', 'Mexico City Region', 'Buenos Aires'], country: 'Brazil / Mexico / Argentina' },
        { name: 'Middle East & Africa', states: ['Dubai Region', 'Riyadh Province', 'Gauteng'], country: 'UAE / KSA / South Africa' }
    ];

    const SEGMENTS = ['Consumer', 'Corporate', 'Home Office'];
    const SHIP_MODES = ['Standard Class', 'Second Class', 'First Class', 'Same Day'];
    const PAYMENT_METHODS = ['Credit Card', 'PayPal', 'Apple Pay', 'BNPL (Klarna)', 'Bank Transfer'];

    // Deterministic pseudo-random number generator with seed
    function pseudoRandom(seed) {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    /**
     * 1. Multi-Relational Synthetic Data Generator
     * Generates 4 interconnected tables: Customers, Products, Orders, Order Items (with intentional duplicates/typos for cleaning demonstration)
     */
    function generateSyntheticDataset(seedOffset = 101) {
        let seed = seedOffset;
        const rand = () => pseudoRandom(seed++);

        // A. Generate Customers (400 records)
        const firstNames = ['Alexander', 'Sophia', 'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Aarav', 'Ananya', 'Hiroshi', 'Yuki', 'Carlos', 'Mariana', 'Kwame', 'Zainab', 'Sven', 'Freja'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Sharma', 'Patel', 'Tanaka', 'Sato', 'Silva', 'Santos', 'Osei', 'Al-Mansoor', 'Lindqvist', 'Nielsen'];

        const customers = [];
        const startDate = new Date('2024-01-01T00:00:00Z');
        const endDate = new Date('2025-09-30T23:59:59Z');

        for (let i = 1; i <= 450; i++) {
            const firstName = firstNames[Math.floor(rand() * firstNames.length)];
            const lastName = lastNames[Math.floor(rand() * lastNames.length)];
            const regionObj = REGIONS[Math.floor(rand() * REGIONS.length)];
            const state = regionObj.states[Math.floor(rand() * regionObj.states.length)];
            const signupDaysOffset = Math.floor(rand() * 450); // 0 to 450 days after Jan 1 2024
            const signupDate = new Date(startDate.getTime() + signupDaysOffset * 24 * 60 * 60 * 1000);

            customers.push({
                customer_id: `CUST-${10000 + i}`,
                customer_name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
                segment: SEGMENTS[Math.floor(rand() * SEGMENTS.length)],
                region: regionObj.name,
                state: state,
                country: regionObj.country,
                signup_date: signupDate.toISOString().split('T')[0],
                signup_month: signupDate.toISOString().substring(0, 7) // YYYY-MM
            });
        }

        // B. Generate Products (60 catalog products)
        const productsCatalog = [
            // Electronics
            { name: 'UltraHD Noise-Canceling Headphones', cat: 'Electronics', price: 249.99, cost: 110.00 },
            { name: 'Wireless Ergonomic Mechanical Keyboard', cat: 'Electronics', price: 129.99, cost: 55.00 },
            { name: '4K Smart Monitor 27-inch', cat: 'Electronics', price: 389.00, cost: 210.00 },
            { name: 'Portable Power Bank 20,000mAh', cat: 'Electronics', price: 49.99, cost: 18.00 },
            { name: 'Smartwatch Fitness Tracker Pro', cat: 'Electronics', price: 199.50, cost: 85.00 },
            { name: 'High-Speed Wi-Fi 6 Mesh Router', cat: 'Electronics', price: 179.99, cost: 80.00 },
            { name: 'Bluetooth Conference Speakerphone', cat: 'Electronics', price: 89.99, cost: 35.00 },
            { name: 'USB-C Multi-Port Docking Station', cat: 'Electronics', price: 74.50, cost: 28.00 },
            
            // Apparel & Fashion
            { name: 'Organic Cotton Oxford Shirt', cat: 'Apparel & Fashion', price: 65.00, cost: 20.00 },
            { name: 'Merino Wool Crewneck Sweater', cat: 'Apparel & Fashion', price: 110.00, cost: 38.00 },
            { name: 'All-Weather Waterproof Jacket', cat: 'Apparel & Fashion', price: 165.00, cost: 60.00 },
            { name: 'Slim-Fit Stretch Chino Pants', cat: 'Apparel & Fashion', price: 58.00, cost: 18.00 },
            { name: 'Breathable Running Performance Shorts', cat: 'Apparel & Fashion', price: 42.00, cost: 12.00 },
            { name: 'Genuine Leather Minimalist Wallet', cat: 'Apparel & Fashion', price: 45.00, cost: 14.00 },
            { name: 'Polarized UV Sunglasses', cat: 'Apparel & Fashion', price: 85.00, cost: 22.00 },

            // Home & Kitchen
            { name: 'Stainless Steel Espresso Machine', cat: 'Home & Kitchen', price: 299.99, cost: 140.00 },
            { name: 'Smart HEPA Air Purifier', cat: 'Home & Kitchen', price: 159.00, cost: 70.00 },
            { name: 'Cast Iron Enamelled Dutch Oven', cat: 'Home & Kitchen', price: 119.50, cost: 45.00 },
            { name: 'Robot Vacuum Cleaner with Mop', cat: 'Home & Kitchen', price: 349.00, cost: 175.00 },
            { name: 'Non-Stick Chef Knife Set (8-Piece)', cat: 'Home & Kitchen', price: 79.99, cost: 25.00 },
            { name: 'Programmable Cold Brew Coffee Maker', cat: 'Home & Kitchen', price: 39.99, cost: 12.00 },
            { name: 'Memory Foam Ergonomic Pillow', cat: 'Home & Kitchen', price: 49.00, cost: 15.00 },

            // Beauty & Personal Care
            { name: 'Hydrating Botanical Face Serum', cat: 'Beauty & Personal Care', price: 54.00, cost: 10.00 },
            { name: 'Sonic Electric Toothbrush Elite', cat: 'Beauty & Personal Care', price: 89.99, cost: 28.00 },
            { name: 'Organic Argan Hair Repair Oil', cat: 'Beauty & Personal Care', price: 32.50, cost: 6.50 },
            { name: 'Ionic Hair Dryer with Diffuser', cat: 'Beauty & Personal Care', price: 125.00, cost: 42.00 },
            { name: 'SPF 50 Mineral Sunscreen Lotion', cat: 'Beauty & Personal Care', price: 28.00, cost: 5.00 },

            // Sports & Outdoors
            { name: 'Non-Slip Eco Yoga Mat', cat: 'Sports & Outdoors', price: 48.00, cost: 14.00 },
            { name: 'Adjustable Quick-Lock Dumbbells', cat: 'Sports & Outdoors', price: 219.00, cost: 95.00 },
            { name: 'Trailburst Waterproof Hiking Boots', cat: 'Sports & Outdoors', price: 145.00, cost: 52.00 },
            { name: 'Insulated Stainless Water Bottle 32oz', cat: 'Sports & Outdoors', price: 34.99, cost: 8.50 },
            { name: 'Ultralight 2-Person Camping Tent', cat: 'Sports & Outdoors', price: 189.00, cost: 75.00 },

            // Books & Media
            { name: 'Data Science & Machine Learning Handbook', cat: 'Books & Media', price: 59.99, cost: 15.00 },
            { name: 'Modern Leadership & Strategy Playbook', cat: 'Books & Media', price: 29.99, cost: 7.00 },
            { name: 'The Art of UI/UX System Design', cat: 'Books & Media', price: 44.50, cost: 11.00 },
            { name: 'Digital Productivity & Mindset Journal', cat: 'Books & Media', price: 24.00, cost: 5.00 },

            // Office Supplies
            { name: 'Ergonomic Executive Mesh Chair', cat: 'Office Supplies', price: 279.00, cost: 130.00 },
            { name: 'Electric Dual-Motor Standing Desk', cat: 'Office Supplies', price: 449.00, cost: 220.00 },
            { name: 'Aluminum Laptop Stand Riser', cat: 'Office Supplies', price: 39.99, cost: 11.00 },
            { name: 'Large Felt Desk Mat Pad', cat: 'Office Supplies', price: 26.50, cost: 6.00 }
        ];

        const products = productsCatalog.map((item, idx) => {
            // Introduce intentional raw category inconsistencies (15% chance) for cleaning demonstration
            let rawCategory = item.cat;
            if (rand() < 0.15) {
                if (item.cat === 'Electronics') rawCategory = rand() > 0.5 ? 'Electrnoics' : 'electronics';
                else if (item.cat === 'Apparel & Fashion') rawCategory = rand() > 0.5 ? 'Apparel' : 'apparel & fashion';
                else if (item.cat === 'Home & Kitchen') rawCategory = 'home & kitchen';
                else if (item.cat === 'Beauty & Personal Care') rawCategory = 'Beauty';
                else if (item.cat === 'Sports & Outdoors') rawCategory = 'sports';
                else if (item.cat === 'Office Supplies') rawCategory = 'office supplies';
            }

            return {
                product_id: `PROD-${2000 + idx + 1}`,
                product_name: item.name,
                category: rawCategory,
                standardized_category: item.cat,
                unit_price: item.price,
                unit_cost: item.cost,
                margin_per_unit: parseFloat((item.price - item.cost).toFixed(2))
            };
        });

        // C. Generate Orders & Order Items (1,600 transactions across Jan 2024 to Sep 2025)
        const rawOrders = [];
        const rawOrderItems = [];
        let orderIdCounter = 5000;

        for (let i = 0; i < 1600; i++) {
            orderIdCounter++;
            const orderId = `ORD-${orderIdCounter}`;

            // Pick customer
            const customer = customers[Math.floor(rand() * customers.length)];
            const signupDateObj = new Date(customer.signup_date);

            // Order date must be on or after customer signup date
            const daysAfterSignup = Math.floor(rand() * 400);
            let orderTimestamp = new Date(signupDateObj.getTime() + daysAfterSignup * 24 * 60 * 60 * 1000);
            if (orderTimestamp > endDate) orderTimestamp = new Date(endDate.getTime() - Math.floor(rand() * 30) * 24 * 60 * 60 * 1000);

            const orderDateStr = orderTimestamp.toISOString().split('T')[0];
            const orderMonthStr = orderTimestamp.toISOString().substring(0, 7);

            const shipMode = SHIP_MODES[Math.floor(rand() * SHIP_MODES.length)];
            const paymentMethod = PAYMENT_METHODS[Math.floor(rand() * PAYMENT_METHODS.length)];

            // Order Status: ~84% Completed, ~11% Refunded, ~3% Cancelled, ~2% Processing
            const statusRand = rand();
            let orderStatus = 'Completed';
            if (statusRand < 0.11) orderStatus = 'Refunded';
            else if (statusRand < 0.14) orderStatus = 'Cancelled';
            else if (statusRand < 0.16) orderStatus = 'Processing';

            // Items in order (1 to 4 items)
            const numItems = Math.floor(1 + rand() * 3.5);
            let orderGrossTotal = 0;
            let orderNetTotal = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(rand() * products.length)];
                const quantity = Math.floor(1 + rand() * 3);
                
                // Discount (0%, 5%, 10%, 15%, 20%)
                const discountPct = [0, 0, 0, 0.05, 0.10, 0.15, 0.20][Math.floor(rand() * 7)];
                
                const grossAmount = parseFloat((quantity * product.unit_price).toFixed(2));
                const discountAmount = parseFloat((grossAmount * discountPct).toFixed(2));
                let netAmount = parseFloat((grossAmount - discountAmount).toFixed(2));
                let isRefunded = orderStatus === 'Refunded';
                let refundAmount = 0;

                if (isRefunded) {
                    refundAmount = netAmount;
                    netAmount = 0; // Net revenue is 0 for refunded items
                }

                const totalCost = parseFloat((quantity * product.unit_cost).toFixed(2));
                const grossProfit = isRefunded ? -totalCost : parseFloat((netAmount - totalCost).toFixed(2));

                const itemRecord = {
                    item_id: `ITEM-${orderIdCounter}-${j + 1}`,
                    order_id: orderId,
                    customer_id: customer.customer_id,
                    product_id: product.product_id,
                    category: product.category, // may be un-normalized
                    quantity: quantity,
                    unit_price: product.unit_price,
                    unit_cost: product.unit_cost,
                    discount_pct: discountPct,
                    discount_amount: discountAmount,
                    gross_amount: grossAmount,
                    net_amount: netAmount,
                    total_cost: totalCost,
                    gross_profit: grossProfit,
                    order_status: orderStatus,
                    refund_amount: refundAmount,
                    order_date: orderDateStr,
                    order_month: orderMonthStr,
                    customer_signup_month: customer.signup_month,
                    region: customer.region,
                    state: customer.state,
                    country: customer.country,
                    ship_mode: shipMode,
                    payment_method: paymentMethod
                };

                rawOrderItems.push(itemRecord);
                orderGrossTotal += grossAmount;
                orderNetTotal += netAmount;
            }

            rawOrders.push({
                order_id: orderId,
                customer_id: customer.customer_id,
                order_date: orderDateStr,
                order_month: orderMonthStr,
                order_status: orderStatus,
                gross_total: parseFloat(orderGrossTotal.toFixed(2)),
                net_total: parseFloat(orderNetTotal.toFixed(2)),
                item_count: numItems,
                ship_mode: shipMode,
                payment_method: paymentMethod
            });
        }

        // D. Inject Intentional Duplicates & Missing Values (for Data Cleaning demonstration)
        const dirtyOrderItems = [...rawOrderItems];
        
        // Inject 25 exact duplicates
        for (let d = 0; d < 25; d++) {
            const dupIndex = Math.floor(rand() * rawOrderItems.length);
            dirtyOrderItems.push({ ...rawOrderItems[dupIndex] });
        }

        // Inject missing values (null region, null payment_method, null category) in ~20 records
        for (let m = 0; m < 20; m++) {
            const nullIdx = Math.floor(rand() * dirtyOrderItems.length);
            if (m % 3 === 0) dirtyOrderItems[nullIdx].region = null;
            else if (m % 3 === 1) dirtyOrderItems[nullIdx].category = null;
            else dirtyOrderItems[nullIdx].payment_method = null;
        }

        return {
            customers,
            products,
            orders: rawOrders,
            orderItems: dirtyOrderItems
        };
    }

    /**
     * 2. Automated Data Quality Cleaner & Normalizer
     * Cleans duplicates, missing values, refund amounts, category harmonization
     */
    function cleanAndNormalizeDataset(rawEngineOutput) {
        const { customers, products, orders, orderItems } = rawEngineOutput;
        
        const logs = [];
        let duplicatesRemoved = 0;
        let missingValuesImputed = 0;
        let categoriesHarmonized = 0;
        let refundsProcessed = 0;

        const seenKeys = new Set();
        const cleanItems = [];

        // Map for quick customer & product lookups
        const customerMap = new Map(customers.map(c => [c.customer_id, c]));
        const productMap = new Map(products.map(p => [p.product_id, p]));

        orderItems.forEach(item => {
            // Check 1: Deduplication key (order_id + product_id + item_id)
            const dupKey = `${item.order_id}_${item.product_id}_${item.item_id}`;
            if (seenKeys.has(dupKey)) {
                duplicatesRemoved++;
                return; // Skip duplicate record
            }
            seenKeys.add(dupKey);

            const itemCopy = { ...item };

            // Check 2: Impute Missing Customer or Location Data
            if (!itemCopy.region || !itemCopy.state) {
                const cust = customerMap.get(itemCopy.customer_id);
                if (cust) {
                    itemCopy.region = cust.region;
                    itemCopy.state = cust.state;
                    itemCopy.country = cust.country;
                } else {
                    itemCopy.region = 'North America';
                    itemCopy.state = 'California';
                    itemCopy.country = 'USA / Canada';
                }
                missingValuesImputed++;
            }

            if (!itemCopy.payment_method) {
                itemCopy.payment_method = 'Credit Card';
                missingValuesImputed++;
            }

            // Check 3: Category Harmonization & Normalization
            if (!itemCopy.category || itemCopy.category === 'null') {
                const prod = productMap.get(itemCopy.product_id);
                itemCopy.category = prod ? prod.standardized_category : 'Electronics';
                missingValuesImputed++;
            } else if (DIRTY_CATEGORY_MAP[itemCopy.category]) {
                itemCopy.category = DIRTY_CATEGORY_MAP[itemCopy.category];
                categoriesHarmonized++;
            }

            // Check 4: Refund Amount & Net Revenue Logic
            if (itemCopy.order_status === 'Refunded') {
                refundsProcessed++;
                itemCopy.net_amount = 0;
                itemCopy.refund_amount = itemCopy.gross_amount - (itemCopy.discount_amount || 0);
                itemCopy.gross_profit = -(itemCopy.total_cost || 0);
            }

            cleanItems.push(itemCopy);
        });

        // Compute Data Quality Score (0-100%)
        const totalRawRecords = orderItems.length;
        const totalCleanRecords = cleanItems.length;
        const issuesFound = duplicatesRemoved + missingValuesImputed + categoriesHarmonized;
        const qualityScore = Math.max(70, Math.min(100, parseFloat((100 - (issuesFound / totalRawRecords) * 100).toFixed(1))));

        logs.push(`[Deduplication] Removed ${duplicatesRemoved} duplicate order line item records.`);
        logs.push(`[Imputation] Imputed missing values for ${missingValuesImputed} fields (Regions, Payment Methods, Categories).`);
        logs.push(`[Category Normalization] Harmonized ${categoriesHarmonized} inconsistent category spellings (e.g., 'Electrnoics' -> 'Electronics').`);
        logs.push(`[Refund Processing] Processed and standardized ${refundsProcessed} refunded transactions.`);
        logs.push(`[Quality Audit] Final Dataset: ${totalCleanRecords} clean records (Data Health Index: ${qualityScore}%).`);

        return {
            cleanOrderItems: cleanItems,
            customers,
            products,
            orders,
            auditReport: {
                totalRawRecords,
                totalCleanRecords,
                duplicatesRemoved,
                missingValuesImputed,
                categoriesHarmonized,
                refundsProcessed,
                qualityScore,
                logs
            }
        };
    }

    /**
     * 3. Compute High-Level Executive Dashboard KPIs
     */
    function calculateKPIs(orderItems) {
        if (!orderItems || orderItems.length === 0) {
            return {
                grossRevenue: 0,
                netRevenue: 0,
                totalOrders: 0,
                completedOrders: 0,
                refundedOrders: 0,
                refundRate: 0,
                totalProfit: 0,
                profitMarginPct: 0,
                aov: 0,
                repeatCustomerRate: 0,
                activeCustomers: 0,
                totalUnitsSold: 0
            };
        }

        let grossRevenue = 0;
        let netRevenue = 0;
        let totalProfit = 0;
        let totalCost = 0;
        let totalUnitsSold = 0;

        const uniqueOrderIds = new Set();
        const completedOrderIds = new Set();
        const refundedOrderIds = new Set();
        const customerOrderCounts = new Map();

        orderItems.forEach(item => {
            grossRevenue += item.gross_amount || 0;
            netRevenue += item.net_amount || 0;
            totalProfit += item.gross_profit || 0;
            totalCost += item.total_cost || 0;
            totalUnitsSold += item.quantity || 0;

            uniqueOrderIds.add(item.order_id);
            if (item.order_status === 'Completed' || item.order_status === 'Shipped') {
                completedOrderIds.add(item.order_id);
            } else if (item.order_status === 'Refunded') {
                refundedOrderIds.add(item.order_id);
            }

            // Customer order counts
            const currentCount = customerOrderCounts.get(item.customer_id) || 0;
            customerOrderCounts.set(item.customer_id, currentCount + 1);
        });

        const totalOrders = uniqueOrderIds.size;
        const completedOrders = completedOrderIds.size;
        const refundedOrders = refundedOrderIds.size;
        const activeCustomers = customerOrderCounts.size;

        // Count repeat customers (>1 order)
        let repeatCustomers = 0;
        customerOrderCounts.forEach(count => {
            if (count > 1) repeatCustomers++;
        });

        const repeatCustomerRate = activeCustomers > 0 ? parseFloat(((repeatCustomers / activeCustomers) * 100).toFixed(1)) : 0;
        const aov = completedOrders > 0 ? parseFloat((netRevenue / completedOrders).toFixed(2)) : 0;
        const profitMarginPct = netRevenue > 0 ? parseFloat(((totalProfit / netRevenue) * 100).toFixed(1)) : 0;
        const refundRate = grossRevenue > 0 ? parseFloat((((grossRevenue - netRevenue) / grossRevenue) * 100).toFixed(1)) : 0;

        return {
            grossRevenue: parseFloat(grossRevenue.toFixed(2)),
            netRevenue: parseFloat(netRevenue.toFixed(2)),
            totalOrders,
            completedOrders,
            refundedOrders,
            refundRate,
            totalProfit: parseFloat(totalProfit.toFixed(2)),
            profitMarginPct,
            aov,
            repeatCustomerRate,
            activeCustomers,
            totalUnitsSold
        };
    }

    /**
     * 4. Monthly & Quarterly Revenue / Profit Trend Analysis
     */
    function calculateMonthlyTrends(orderItems) {
        const monthMap = new Map();

        orderItems.forEach(item => {
            const m = item.order_month || '2024-01';
            if (!monthMap.has(m)) {
                monthMap.set(m, {
                    month: m,
                    grossRevenue: 0,
                    netRevenue: 0,
                    profit: 0,
                    orders: new Set(),
                    units: 0
                });
            }

            const data = monthMap.get(m);
            data.grossRevenue += item.gross_amount || 0;
            data.netRevenue += item.net_amount || 0;
            data.profit += item.gross_profit || 0;
            data.orders.add(item.order_id);
            data.units += item.quantity || 0;
        });

        // Sort by month chronological order
        const sortedMonths = Array.from(monthMap.keys()).sort();

        return sortedMonths.map(m => {
            const d = monthMap.get(m);
            const orderCount = d.orders.size;
            const aov = orderCount > 0 ? parseFloat((d.netRevenue / orderCount).toFixed(2)) : 0;
            const marginPct = d.netRevenue > 0 ? parseFloat(((d.profit / d.netRevenue) * 100).toFixed(1)) : 0;

            return {
                month: m,
                grossRevenue: parseFloat(d.grossRevenue.toFixed(2)),
                netRevenue: parseFloat(d.netRevenue.toFixed(2)),
                profit: parseFloat(d.profit.toFixed(2)),
                orderCount,
                aov,
                marginPct,
                units: d.units
            };
        });
    }

    /**
     * 5. Customer Acquisition Cohort Analysis Matrix
     * Tracks customer retention rate month-by-month (Month 0 to Month 8)
     */
    function calculateCohortMatrix(orderItems, customers) {
        const customerSignupMap = new Map(customers.map(c => [c.customer_id, c.signup_month]));
        const cohortData = new Map(); // signup_month -> { cohortSize, months: [count_m0, count_m1, ...] }

        // Determine unique customer orders by month
        const customerActivity = new Map(); // customer_id -> Set of activity_months

        orderItems.forEach(item => {
            if (item.order_status === 'Cancelled') return;
            if (!customerActivity.has(item.customer_id)) {
                customerActivity.set(item.customer_id, new Set());
            }
            customerActivity.get(item.customer_id).add(item.order_month);
        });

        // Group customers by signup cohort
        customers.forEach(c => {
            const signupMonth = c.signup_month;
            if (!signupMonth) return;

            if (!cohortData.has(signupMonth)) {
                cohortData.set(signupMonth, {
                    cohortMonth: signupMonth,
                    cohortSize: 0,
                    retentionByMonth: Array(9).fill(0) // Month 0 to Month 8
                });
            }

            const cohort = cohortData.get(signupMonth);
            cohort.cohortSize++;

            const activeMonths = customerActivity.get(c.customer_id);
            if (activeMonths) {
                activeMonths.forEach(actMonth => {
                    // Calculate month difference
                    const signupDateObj = new Date(signupMonth + '-01');
                    const actDateObj = new Date(actMonth + '-01');
                    const monthDiff = (actDateObj.getFullYear() - signupDateObj.getFullYear()) * 12 + (actDateObj.getMonth() - signupDateObj.getMonth());

                    if (monthDiff >= 0 && monthDiff < 9) {
                        cohort.retentionByMonth[monthDiff]++;
                    }
                });
            }
        });

        // Convert counts to retention percentages
        const sortedCohorts = Array.from(cohortData.keys()).sort().slice(0, 10); // Display top 10 recent cohorts

        const matrix = sortedCohorts.map(m => {
            const c = cohortData.get(m);
            const size = c.cohortSize || 1;

            const percentages = c.retentionByMonth.map((count, monthIdx) => {
                if (monthIdx === 0) return 100.0;
                return parseFloat(((count / size) * 100).toFixed(1));
            });

            return {
                cohortMonth: m,
                cohortSize: size,
                percentages
            };
        });

        return matrix;
    }

    /**
     * 6. RFM Customer Behavioral Segmentation (Recency, Frequency, Monetary)
     */
    function calculateRFMSegments(orderItems, customers) {
        // Aggregate per customer
        const customerStats = new Map();
        const referenceDate = new Date('2025-10-01T00:00:00Z');

        orderItems.forEach(item => {
            if (item.order_status === 'Cancelled') return;
            const cid = item.customer_id;
            if (!customerStats.has(cid)) {
                customerStats.set(cid, {
                    customer_id: cid,
                    lastOrderDate: item.order_date,
                    orderSet: new Set(),
                    totalSpend: 0,
                    categories: new Set()
                });
            }

            const stats = customerStats.get(cid);
            if (new Date(item.order_date) > new Date(stats.lastOrderDate)) {
                stats.lastOrderDate = item.order_date;
            }
            stats.orderSet.add(item.order_id);
            stats.totalSpend += item.net_amount || 0;
            if (item.category) stats.categories.add(item.category);
        });

        const customerList = [];
        const customerMap = new Map(customers.map(c => [c.customer_id, c]));

        customerStats.forEach((stats, cid) => {
            const cust = customerMap.get(cid);
            const daysSinceLastOrder = Math.max(1, Math.floor((referenceDate - new Date(stats.lastOrderDate)) / (1000 * 60 * 60 * 24)));
            const frequency = stats.orderSet.size;
            const monetary = parseFloat(stats.totalSpend.toFixed(2));

            customerList.push({
                customer_id: cid,
                name: cust ? cust.customer_name : cid,
                email: cust ? cust.email : '',
                region: cust ? cust.region : 'Unknown',
                recencyDays: daysSinceLastOrder,
                frequency: frequency,
                monetary: monetary,
                favoriteCategory: Array.from(stats.categories)[0] || 'Electronics'
            });
        });

        if (customerList.length === 0) return { segments: {}, customers: [] };

        // Rank and score R, F, M (1 to 5)
        const sortedR = [...customerList].sort((a, b) => a.recencyDays - b.recencyDays); // Lower days = higher score
        const sortedF = [...customerList].sort((a, b) => b.frequency - a.frequency);     // Higher frequency = higher score
        const sortedM = [...customerList].sort((a, b) => b.monetary - a.monetary);       // Higher monetary = higher score

        const n = customerList.length;

        customerList.forEach(c => {
            const rRank = sortedR.findIndex(x => x.customer_id === c.customer_id);
            const fRank = sortedF.findIndex(x => x.customer_id === c.customer_id);
            const mRank = sortedM.findIndex(x => x.customer_id === c.customer_id);

            c.rScore = Math.ceil(5 - (rRank / n) * 5);
            c.fScore = Math.ceil(5 - (fRank / n) * 5);
            c.mScore = Math.ceil(5 - (mRank / n) * 5);

            // Segment Classification Logic
            const r = c.rScore;
            const f = c.fScore;
            const m = c.mScore;

            if (r >= 4 && f >= 4 && m >= 4) c.segment = 'Champions';
            else if (r >= 3 && f >= 3 && m >= 3) c.segment = 'Loyal Customers';
            else if (r >= 4 && f <= 2) c.segment = 'New Customers';
            else if (r >= 3 && f <= 3 && m >= 3) c.segment = 'Potential Loyalists';
            else if (r <= 2 && m >= 4) c.segment = 'At-Risk VIPs';
            else if (r <= 2 && f <= 2 && m <= 2) c.segment = 'Hibernating';
            else c.segment = 'Needs Attention';
        });

        // Group counts & metrics by segment
        const segmentCounts = {
            'Champions': { count: 0, totalSpend: 0, avgAOV: 0 },
            'Loyal Customers': { count: 0, totalSpend: 0, avgAOV: 0 },
            'Potential Loyalists': { count: 0, totalSpend: 0, avgAOV: 0 },
            'New Customers': { count: 0, totalSpend: 0, avgAOV: 0 },
            'At-Risk VIPs': { count: 0, totalSpend: 0, avgAOV: 0 },
            'Hibernating': { count: 0, totalSpend: 0, avgAOV: 0 },
            'Needs Attention': { count: 0, totalSpend: 0, avgAOV: 0 }
        };

        customerList.forEach(c => {
            if (segmentCounts[c.segment]) {
                segmentCounts[c.segment].count++;
                segmentCounts[c.segment].totalSpend += c.monetary;
            }
        });

        Object.keys(segmentCounts).forEach(seg => {
            const s = segmentCounts[seg];
            s.totalSpend = parseFloat(s.totalSpend.toFixed(2));
            s.avgSpend = s.count > 0 ? parseFloat((s.totalSpend / s.count).toFixed(2)) : 0;
        });

        return {
            segmentSummary: segmentCounts,
            customerList: customerList.sort((a, b) => b.monetary - a.monetary) // top spenders first
        };
    }

    /**
     * 7. Top Products, Pareto (80/20) & Category Performance
     */
    function calculateProductAnalytics(orderItems) {
        const prodMap = new Map();
        const catMap = new Map();

        orderItems.forEach(item => {
            // Product Aggregation
            const pid = item.product_id;
            if (!prodMap.has(pid)) {
                prodMap.set(pid, {
                    product_id: pid,
                    category: item.category,
                    unitsSold: 0,
                    grossRevenue: 0,
                    netRevenue: 0,
                    profit: 0,
                    refundCount: 0,
                    totalOrders: new Set()
                });
            }

            const pData = prodMap.get(pid);
            pData.unitsSold += item.quantity || 0;
            pData.grossRevenue += item.gross_amount || 0;
            pData.netRevenue += item.net_amount || 0;
            pData.profit += item.gross_profit || 0;
            if (item.order_status === 'Refunded') pData.refundCount++;
            pData.totalOrders.add(item.order_id);

            // Category Aggregation
            const cat = item.category || 'Unassigned';
            if (!catMap.has(cat)) {
                catMap.set(cat, {
                    category: cat,
                    grossRevenue: 0,
                    netRevenue: 0,
                    profit: 0,
                    refundAmount: 0,
                    unitsSold: 0,
                    orderCount: new Set()
                });
            }

            const cData = catMap.get(cat);
            cData.grossRevenue += item.gross_amount || 0;
            cData.netRevenue += item.net_amount || 0;
            cData.profit += item.gross_profit || 0;
            cData.refundAmount += item.refund_amount || 0;
            cData.unitsSold += item.quantity || 0;
            cData.orderCount.add(item.order_id);
        });

        // Process Products List & Product Names mapping
        const productsList = Array.from(prodMap.values()).map(p => {
            const totalOrdersCount = p.totalOrders.size;
            const refundRate = totalOrdersCount > 0 ? parseFloat(((p.refundCount / totalOrdersCount) * 100).toFixed(1)) : 0;
            const marginPct = p.netRevenue > 0 ? parseFloat(((p.profit / p.netRevenue) * 100).toFixed(1)) : 0;

            return {
                product_id: p.product_id,
                category: p.category,
                unitsSold: p.unitsSold,
                grossRevenue: parseFloat(p.grossRevenue.toFixed(2)),
                netRevenue: parseFloat(p.netRevenue.toFixed(2)),
                profit: parseFloat(p.profit.toFixed(2)),
                refundRate,
                marginPct
            };
        }).sort((a, b) => b.netRevenue - a.netRevenue);

        // Pareto Analysis (80/20 rule cumulative percentage)
        const totalNetRev = productsList.reduce((acc, p) => acc + p.netRevenue, 0);
        let cumulativeRev = 0;

        productsList.forEach(p => {
            cumulativeRev += p.netRevenue;
            p.cumulativePct = totalNetRev > 0 ? parseFloat(((cumulativeRev / totalNetRev) * 100).toFixed(1)) : 0;
        });

        // Category Summary List
        const categoryList = Array.from(catMap.values()).map(c => {
            const orders = c.orderCount.size;
            const marginPct = c.netRevenue > 0 ? parseFloat(((c.profit / c.netRevenue) * 100).toFixed(1)) : 0;
            const refundRate = c.grossRevenue > 0 ? parseFloat(((c.refundAmount / c.grossRevenue) * 100).toFixed(1)) : 0;
            const aov = orders > 0 ? parseFloat((c.netRevenue / orders).toFixed(2)) : 0;

            return {
                category: c.category,
                grossRevenue: parseFloat(c.grossRevenue.toFixed(2)),
                netRevenue: parseFloat(c.netRevenue.toFixed(2)),
                profit: parseFloat(c.profit.toFixed(2)),
                refundAmount: parseFloat(c.refundAmount.toFixed(2)),
                marginPct,
                refundRate,
                aov,
                unitsSold: c.unitsSold
            };
        }).sort((a, b) => b.netRevenue - a.netRevenue);

        return {
            topProducts: productsList,
            categorySummary: categoryList
        };
    }

    /**
     * 8. Regional & Geography Pattern Aggregations
     */
    function calculateRegionalAnalytics(orderItems) {
        const regionMap = new Map();

        orderItems.forEach(item => {
            const reg = item.region || 'North America';
            if (!regionMap.has(reg)) {
                regionMap.set(reg, {
                    region: reg,
                    netRevenue: 0,
                    grossRevenue: 0,
                    profit: 0,
                    orders: new Set(),
                    customers: new Set(),
                    states: new Map()
                });
            }

            const rData = regionMap.get(reg);
            rData.netRevenue += item.net_amount || 0;
            rData.grossRevenue += item.gross_amount || 0;
            rData.profit += item.gross_profit || 0;
            rData.orders.add(item.order_id);
            rData.customers.add(item.customer_id);

            const st = item.state || 'California';
            rData.states.set(st, (rData.states.get(st) || 0) + (item.net_amount || 0));
        });

        return Array.from(regionMap.values()).map(r => {
            const orderCount = r.orders.size;
            const customerCount = r.customers.size;
            const aov = orderCount > 0 ? parseFloat((r.netRevenue / orderCount).toFixed(2)) : 0;
            const marginPct = r.netRevenue > 0 ? parseFloat(((r.profit / r.netRevenue) * 100).toFixed(1)) : 0;

            // Top performing state in region
            let topState = 'N/A';
            let topStateSpend = 0;
            r.states.forEach((spend, st) => {
                if (spend > topStateSpend) {
                    topStateSpend = spend;
                    topState = st;
                }
            });

            return {
                region: r.region,
                netRevenue: parseFloat(r.netRevenue.toFixed(2)),
                grossRevenue: parseFloat(r.grossRevenue.toFixed(2)),
                profit: parseFloat(r.profit.toFixed(2)),
                orderCount,
                customerCount,
                aov,
                marginPct,
                topState
            };
        }).sort((a, b) => b.netRevenue - a.netRevenue);
    }

    /**
     * 9. Algorithmic Strategic Recommendations Generator
     */
    function generateStrategicRecommendations(kpis, categoryAnalytics, rfmData, regionalData) {
        const recommendations = [];

        // Rule 1: High Refund Category Warning
        const highRefundCat = categoryAnalytics.categorySummary.find(c => c.refundRate > 8.0);
        if (highRefundCat) {
            recommendations.push({
                type: 'CRITICAL_WARNING',
                badgeClass: 'badge-danger',
                priority: '🚨 Critical Priority',
                title: `High Refund Rate in '${highRefundCat.category}' (${highRefundCat.refundRate}%)`,
                insight: `The '${highRefundCat.category}' category has generated \$${highRefundCat.refundAmount.toLocaleString()} in returns with a refund rate of ${highRefundCat.refundRate}%, well above the target 5% threshold.`,
                actionableStep: `Audit top-returned SKU quality, review sizing/description accuracy on product pages, and contact suppliers to address defect spikes.`
            });
        }

        // Rule 2: At-Risk VIP Customer Churn Threat
        const atRiskVIPs = rfmData.segmentSummary['At-Risk VIPs'];
        if (atRiskVIPs && atRiskVIPs.count > 0) {
            recommendations.push({
                type: 'CHURN_THREAT',
                badgeClass: 'badge-warning',
                priority: '⚠️ High Risk',
                title: `${atRiskVIPs.count} High-Value VIP Customers At Risk of Churn`,
                insight: `${atRiskVIPs.count} high-spending VIP customers haven't purchased in >90 days, representing \$${atRiskVIPs.totalSpend.toLocaleString()} in historical revenue.`,
                actionableStep: `Trigger personalized VIP win-back campaigns featuring exclusive 15% discount incentives and early access to new product arrivals.`
            });
        }

        // Rule 3: Cross-Selling & AOV Regional Gap
        if (regionalData.length > 1) {
            const highestAOVRegion = [...regionalData].sort((a, b) => b.aov - a.aov)[0];
            const lowestAOVRegion = [...regionalData].sort((a, b) => a.aov - b.aov)[0];

            if (highestAOVRegion && lowestAOVRegion && highestAOVRegion.aov > lowestAOVRegion.aov * 1.25) {
                recommendations.push({
                    type: 'GROWTH_OPPORTUNITY',
                    badgeClass: 'badge-info',
                    priority: '💡 Growth Opportunity',
                    title: `Capitalize on Regional AOV Gap between ${highestAOVRegion.region} (\$${highestAOVRegion.aov}) and ${lowestAOVRegion.region} (\$${lowestAOVRegion.aov})`,
                    insight: `Average Order Value in ${lowestAOVRegion.region} is ${parseFloat((100 - (lowestAOVRegion.aov / highestAOVRegion.aov) * 100).toFixed(1))}% lower than ${highestAOVRegion.region}.`,
                    actionableStep: `Introduce free-shipping order thresholds and localized product bundles tailored to ${lowestAOVRegion.region} buyers.`
                });
            }
        }

        // Rule 4: Repeat Customer Retention Boost
        if (kpis.repeatCustomerRate < 35) {
            recommendations.push({
                type: 'RETENTION_LIFT',
                badgeClass: 'badge-primary',
                priority: '📈 Strategic Goal',
                title: `Repeat Customer Rate is ${kpis.repeatCustomerRate}% (Target: >40%)`,
                insight: `Only ${kpis.repeatCustomerRate}% of active customers return for a second order, leaving substantial Customer Lifetime Value untapped.`,
                actionableStep: `Implement an automated post-purchase email nurture series (Day 7 thank-you, Day 21 replenishment reminder) and tier-based loyalty points.`
            });
        }

        // Rule 5: Low Profit Margin Category Optimization
        const lowMarginCat = categoryAnalytics.categorySummary.find(c => c.marginPct < 25.0);
        if (lowMarginCat) {
            recommendations.push({
                type: 'MARGIN_OPTIMIZATION',
                badgeClass: 'badge-secondary',
                priority: '⚙️ Operational Efficiency',
                title: `Low Profit Margin in '${lowMarginCat.category}' (${lowMarginCat.marginPct}%)`,
                insight: `'${lowMarginCat.category}' generates high gross volume but delivers a profit margin of only ${lowMarginCat.marginPct}%.`,
                actionableStep: `Renegotiate wholesale vendor unit costs, reduce promotional discount caps from 20% to 10%, or bundle high-margin accessories.`
            });
        }

        return recommendations;
    }

    /**
     * 10. Interactive What-If Scenario Simulator
     * Projects business impact of changing price, refund rates, and repeat customer retention
     */
    function simulateBusinessScenario(kpis, inputs) {
        const { priceChangePct, refundReductionPct, retentionBoostPct } = inputs;

        const baseNetRev = kpis.netRevenue;
        const baseProfit = kpis.totalProfit;
        const baseMarginPct = kpis.profitMarginPct;

        // Calculate simulated adjustments
        // 1. Price elasticity effect: 1% price increase yields ~0.85% net revenue lift
        const priceRevImpact = baseNetRev * (priceChangePct / 100) * 0.85;

        // 2. Refund reduction: Saves refund dollars directly to net revenue and profit
        const grossRev = kpis.grossRevenue;
        const currentRefundAmt = grossRev - baseNetRev;
        const refundSavings = currentRefundAmt * (refundReductionPct / 100);

        // 3. Repeat retention boost: 1% retention boost increases order volume & net rev by ~1.2%
        const retentionRevImpact = baseNetRev * (retentionBoostPct / 100) * 1.2;

        const projectedNetRevenue = Math.max(0, parseFloat((baseNetRev + priceRevImpact + refundSavings + retentionRevImpact).toFixed(2)));
        
        // Cost of goods scales with retention volume, but price increase and refund savings drop directly to profit margin
        const cogsRatio = 1 - (baseProfit / baseNetRev);
        const incrementalCogs = retentionRevImpact * cogsRatio;
        const projectedProfit = Math.max(0, parseFloat((baseProfit + priceRevImpact + refundSavings + retentionRevImpact - incrementalCogs).toFixed(2)));
        
        const projectedMarginPct = projectedNetRevenue > 0 ? parseFloat(((projectedProfit / projectedNetRevenue) * 100).toFixed(1)) : 0;
        
        const netRevenueLift = projectedNetRevenue - baseNetRev;
        const profitLift = projectedProfit - baseProfit;
        const marginPctLift = parseFloat((projectedMarginPct - baseMarginPct).toFixed(1));

        return {
            baseNetRev,
            baseProfit,
            baseMarginPct,
            projectedNetRevenue,
            projectedProfit,
            projectedMarginPct,
            netRevenueLift: parseFloat(netRevenueLift.toFixed(2)),
            profitLift: parseFloat(profitLift.toFixed(2)),
            marginPctLift
        };
    }

    // Public API Methods
    return {
        generateSyntheticDataset,
        cleanAndNormalizeDataset,
        calculateKPIs,
        calculateMonthlyTrends,
        calculateCohortMatrix,
        calculateRFMSegments,
        calculateProductAnalytics,
        calculateRegionalAnalytics,
        generateStrategicRecommendations,
        simulateBusinessScenario
    };
})();

// Export for Node.js test environment if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataEngine;
}
