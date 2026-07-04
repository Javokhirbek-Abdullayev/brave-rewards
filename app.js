// Simulated Brave Rewards data
const state = {
  balance: 12.45,
  earnings: 3.2,
  adsViewed: 47,
  payout: 10.25,
  activity: [
    { date: '2026-07-02', type: 'Ad View', amount: 0.05, status: 'completed' },
    { date: '2026-07-01', type: 'Ad View', amount: 0.10, status: 'completed' },
    { date: '2026-06-30', type: 'Ad View', amount: 0.05, status: 'completed' },
    { date: '2026-06-29', type: 'Payout', amount: 8.50, status: 'completed' },
    { date: '2026-06-28', type: 'Ad View', amount: 0.05, status: 'pending' },
  ],
};

function updateDashboard() {
  document.getElementById('balance').textContent = state.balance.toFixed(3) + ' BAT';
  document.getElementById('earnings').textContent = state.earnings.toFixed(3) + ' BAT';
  document.getElementById('adsViewed').textContent = state.adsViewed;
  document.getElementById('payout').textContent = state.payout.toFixed(3) + ' BAT';
}

function renderActivity() {
  const tbody = document.getElementById('activityTable');
  tbody.innerHTML = '';

  if (state.activity.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">No activity yet</td></tr>';
    return;
  }

  state.activity.forEach(item => {
    const row = document.createElement('tr');
    const statusClass = item.status === 'completed' ? 'status-completed' : 'status-pending';
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.type}</td>
      <td>${item.amount.toFixed(3)} BAT</td>
      <td class="${statusClass}">${item.status}</td>
    `;
    tbody.appendChild(row);
  });
}

// Settings
document.getElementById('saveSettings').addEventListener('click', () => {
  const autoContribute = document.getElementById('autoContribute').checked;
  const showAds = document.getElementById('showAds').checked;
  const budget = document.getElementById('budget').value;

  const msg = document.createElement('p');
  msg.textContent = 'Settings saved successfully';
  msg.style.cssText = 'color: #3fb950; font-size: 0.85rem; margin-top: 8px;';
  document.querySelector('.settings-form').appendChild(msg);

  setTimeout(() => msg.remove(), 2500);
});

// Init
updateDashboard();
renderActivity();
