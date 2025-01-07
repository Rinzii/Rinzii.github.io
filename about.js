function showTab(tabId, event) {
  // Hide all tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
      tab.classList.remove('active');
  });

  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
  });

  // Show the selected tab content
  document.getElementById(tabId).classList.remove('hidden');
  document.getElementById(tabId).classList.add('active');

  // Mark the clicked tab as active
  event.target.classList.add('active');
}
