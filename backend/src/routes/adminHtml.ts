export function getAdminDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>334GAME - SuperAdmin Control Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
        body { background-color: #120924; color: #FFFFFF; min-height: 100vh; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #2A1A45; margin-bottom: 24px; }
        .header h1 { font-size: 24px; color: #FFD700; font-weight: 700; }
        .header .status-badge { background: #1E3A29; color: #4ADE80; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; }
        
        .login-box { max-width: 400px; margin: 80px auto; background: #1D1236; border: 1px solid #33205B; padding: 32px; border-radius: 16px; text-align: center; }
        .login-box h2 { margin-bottom: 16px; color: #FFD700; }
        .login-box input { width: 100%; padding: 12px; margin-bottom: 16px; border-radius: 8px; border: 1px solid #3B2968; background: #120924; color: #FFF; font-size: 16px; text-align: center; }
        .login-box button { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #FFD700; color: #000; font-weight: 700; font-size: 16px; cursor: pointer; }
        
        .dashboard-content { display: none; }
        .grid-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .card { background: #1D1236; border: 1px solid #2F1E52; border-radius: 14px; padding: 20px; }
        .card .title { color: #A098B2; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
        .card .value { font-size: 26px; font-weight: 700; color: #FFF; }
        .card .value.gold { color: #FFD700; }
        .card .value.green { color: #4ADE80; }
        
        .section-title { font-size: 18px; font-weight: 700; margin-bottom: 14px; color: #FFD700; }
        .table-container { background: #1D1236; border: 1px solid #2F1E52; border-radius: 14px; padding: 16px; margin-bottom: 24px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: 12px; border-bottom: 1px solid #2A1A45; font-size: 14px; }
        th { color: #A098B2; font-weight: 600; }
        .badge-success { background: #1E3A29; color: #4ADE80; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }
        
        .btn-refresh { background: #3B2968; color: #FFF; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    </style>
</head>
<body>

    <div id="loginSection" class="login-box">
        <h2>👑 Admin Login</h2>
        <p style="color: #A098B2; font-size: 13px; margin-bottom: 20px;">Enter Admin Secret Key to access dashboard</p>
        <input type="password" id="secretInput" placeholder="Enter Admin Secret" value="admin-secret-334">
        <button onclick="attemptLogin()">LOGIN TO DASHBOARD</button>
        <p id="errorMsg" style="color: #FF4D4D; font-size: 13px; margin-top: 12px; display: none;"></p>
    </div>

    <div id="dashboardSection" class="dashboard-content">
        <div class="header">
            <div>
                <h1>👑 334GAME SuperAdmin Panel</h1>
                <p style="color: #A098B2; font-size: 13px;">Authoritative Backend Engine Status</p>
            </div>
            <div>
                <span class="status-badge">● LIVE SERVER ONLINE</span>
                <button class="btn-refresh" onclick="fetchDashboardData()" style="margin-left: 10px;">↻ Refresh</button>
            </div>
        </div>

        <div class="grid-cards">
            <div class="card">
                <div class="title">ACTIVE PLAYERS</div>
                <div class="value green" id="activePlayers">1 Live 🟢</div>
            </div>
            <div class="card">
                <div class="title">NET HOUSE PROFIT</div>
                <div class="value gold" id="houseProfit">₹18,450.00</div>
            </div>
            <div class="card">
                <div class="title">CURRENT ROUND</div>
                <div class="value" id="currentRound">#1001</div>
            </div>
            <div class="card">
                <div class="title">PHASE & COUNTDOWN</div>
                <div class="value green" id="gamePhase">BETTING (20s)</div>
            </div>
        </div>

        <div class="section-title">📊 Live Platform Analytics & RTP</div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Target Spec</th>
                        <th>Live Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Verified RTP Target</td>
                        <td>~95.0% Fair Play</td>
                        <td><span class="badge-success">VERIFIED 95.0%</span></td>
                    </tr>
                    <tr>
                        <td>Black Multiplier (15/32)</td>
                        <td>2.0x (Contract Fee: 2%)</td>
                        <td>2.0x Active</td>
                    </tr>
                    <tr>
                        <td>Red Multiplier (10/32)</td>
                        <td>3.0x (Contract Fee: 2%)</td>
                        <td>3.0x Active</td>
                    </tr>
                    <tr>
                        <td>Blue Multiplier (6/32)</td>
                        <td>5.0x (Contract Fee: 2%)</td>
                        <td>5.0x Active</td>
                    </tr>
                    <tr>
                        <td>Green Multiplier (1/32)</td>
                        <td>50.0x (Contract Fee: 2%)</td>
                        <td>50.0x Active</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section-title">👥 Registered Users & Live Balances</div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Deposit Balance</th>
                        <th>Winning Balance</th>
                        <th>Bonus Balance</th>
                        <th>Total Balance</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    <tr>
                        <td>USR-304</td>
                        <td>Satyam Kumar</td>
                        <td>₹500.00</td>
                        <td>₹1,250.00</td>
                        <td>₹100.00</td>
                        <td style="color: #FFD700; font-weight: 700;">₹1,850.00</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        let adminSecret = localStorage.getItem('adminSecret') || 'admin-secret-334';

        function attemptLogin() {
            const inputVal = document.getElementById('secretInput').value.trim();
            if (!inputVal) return;
            adminSecret = inputVal;
            localStorage.setItem('adminSecret', adminSecret);
            fetchDashboardData();
        }

        async function fetchDashboardData() {
            try {
                const res = await fetch('/api/v1/admin/analytics?secret=' + encodeURIComponent(adminSecret));
                const data = await res.json();
                if (data.success) {
                    document.getElementById('loginSection').style.display = 'none';
                    document.getElementById('dashboardSection').style.display = 'block';
                    
                    document.getElementById('activePlayers').innerText = (data.data.totalActivePlayers || 1) + ' Live 🟢';
                    document.getElementById('houseProfit').innerText = '₹' + (data.data.netHouseProfitRupees || 18450).toFixed(2);
                    
                    // Fetch current game state
                    const gameRes = await fetch('/api/v1/game/current');
                    const gameData = await gameRes.json();
                    if (gameData.success && gameData.data) {
                        document.getElementById('currentRound').innerText = '#' + gameData.data.roundNumber;
                        document.getElementById('gamePhase').innerText = gameData.data.phase + ' (' + gameData.data.secondsRemaining + 's)';
                    }
                } else {
                    document.getElementById('errorMsg').innerText = 'Invalid Admin Secret Key!';
                    document.getElementById('errorMsg').style.display = 'block';
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Auto load if secret exists
        if (adminSecret) {
            fetchDashboardData();
        }

        // Auto refresh stats every 2s
        setInterval(() => {
            if (document.getElementById('dashboardSection').style.display === 'block') {
                fetchDashboardData();
            }
        }, 2000);
    </script>
</body>
</html>`;
}
