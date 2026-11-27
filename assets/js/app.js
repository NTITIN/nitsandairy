/**
 * Nitsa IT Solutions - Dairy Management Software
 * Main Application Logic
 */

// Countdown Timer State
let countdownTarget = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initToast();
  initDate();
  calcBill();
});

/**
 * Initialize dynamic countdown timer
 * Shows offer valid time and remaining hours on page load
 */
function initCountdown() {
  // Store or retrieve persistent target time for today's offer
  const storedTarget = localStorage.getItem('nitsa_offer_countdown_end');
  const now = new Date().getTime();

  if (storedTarget && parseInt(storedTarget) > now) {
    countdownTarget = parseInt(storedTarget);
  } else {
    // Set offer valid for 11 hours, 45 minutes, 30 seconds from now
    countdownTarget = now + (11 * 3600 + 45 * 60 + 30) * 1000;
    localStorage.setItem('nitsa_offer_countdown_end', countdownTarget.toString());
  }

  // Update immediately on page load
  updateTimerDisplay();

  // Run countdown loop every second
  setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
  const now = new Date().getTime();
  let distance = countdownTarget - now;

  if (distance <= 0) {
    // Reset to new 12 hours cycle if expired
    countdownTarget = now + 12 * 3600 * 1000;
    localStorage.setItem('nitsa_offer_countdown_end', countdownTarget.toString());
    distance = countdownTarget - now;
  }

  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Top alert bar elements
  const barH = document.getElementById('bar-hours');
  const barM = document.getElementById('bar-minutes');
  const barS = document.getElementById('bar-seconds');
  if (barH) barH.textContent = formattedHours;
  if (barM) barM.textContent = formattedMinutes;
  if (barS) barS.textContent = formattedSeconds;

  // Hero section timer elements
  const heroH = document.getElementById('hero-hours');
  const heroM = document.getElementById('hero-minutes');
  const heroS = document.getElementById('hero-seconds');
  if (heroH) heroH.textContent = formattedHours;
  if (heroM) heroM.textContent = formattedMinutes;
  if (heroS) heroS.textContent = formattedSeconds;

  // Page-load toast alert hours
  const toastHours = document.getElementById('toast-hours');
  if (toastHours) {
    toastHours.textContent = `${hours} hours and ${minutes} mins`;
  }
}

/**
 * On-Page-Load Toast Notification
 * Prominently surfaces the valid time and offer
 */
function initToast() {
  const toast = document.getElementById('offer-toast');
  if (!toast) return;

  // Show after 1.5 seconds on page load
  setTimeout(() => {
    toast.classList.remove('hidden');
    // Force reflow
    void toast.offsetWidth;
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 1200);
}

function dismissToast() {
  const toast = document.getElementById('offer-toast');
  if (toast) {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-32', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 500);
  }
}

/**
 * Book Now Modal Open / Close Handlers
 */
function openBookNowModal() {
  const modal = document.getElementById('book-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeBookNowModal() {
  const modal = document.getElementById('book-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleBackdropClick(e) {
  if (e.target && e.target.id === 'book-modal') {
    closeBookNowModal();
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookNowModal();
  }
});

/**
 * Format Current Date on Slip
 */
function initDate() {
  const dateEl = document.getElementById('slip-date');
  if (dateEl) {
    const today = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('en-GB', options);
  }
}

/**
 * Interactive Milk Rate & Bill Calculator
 */
function calcBill() {
  const milkType = document.querySelector('input[name="milk-type"]:checked')?.value || 'cow';
  const qtyInput = document.getElementById('input-qty');
  const fatInput = document.getElementById('input-fat');
  const snfInput = document.getElementById('input-snf');

  if (!qtyInput || !fatInput || !snfInput) return;

  const qty = parseFloat(qtyInput.value) || 0;
  const fat = parseFloat(fatInput.value) || 0;
  const snf = parseFloat(snfInput.value) || 0;

  // Update slider label numbers
  const qtyVal = document.getElementById('qty-val');
  const fatVal = document.getElementById('fat-val');
  const snfVal = document.getElementById('snf-val');

  if (qtyVal) qtyVal.textContent = `${qty.toFixed(1)} Liters`;
  if (fatVal) fatVal.textContent = `${fat.toFixed(1)}%`;
  if (snfVal) snfVal.textContent = `${snf.toFixed(1)}`;

  // Style radio card selection
  const labelCow = document.getElementById('label-cow');
  const labelBuf = document.getElementById('label-buffalo');
  if (milkType === 'cow') {
    if (labelCow) {
      labelCow.className = 'cursor-pointer border-2 border-emerald-500 bg-emerald-50/50 p-3 rounded-xl flex items-center gap-3 transition-all';
    }
    if (labelBuf) {
      labelBuf.className = 'cursor-pointer border-2 border-slate-200 bg-white p-3 rounded-xl flex items-center gap-3 transition-all';
    }
  } else {
    if (labelCow) {
      labelCow.className = 'cursor-pointer border-2 border-slate-200 bg-white p-3 rounded-xl flex items-center gap-3 transition-all';
    }
    if (labelBuf) {
      labelBuf.className = 'cursor-pointer border-2 border-emerald-500 bg-emerald-50/50 p-3 rounded-xl flex items-center gap-3 transition-all';
    }
  }

  // Calculate rate based on standard dairy formulas
  let rate = 0;
  if (milkType === 'cow') {
    // Standard Cow milk rate formula: Base ~32 for 3.5/8.5
    // Rate = (Fat * 5.2) + (SNF * 1.8)
    rate = (fat * 5.2) + (snf * 1.88);
    if (rate < 25) rate = 25;
  } else {
    // Buffalo milk rate formula: Base ~55 for 6.0/9.0
    // Rate = (Fat * 6.5) + (SNF * 2.1)
    rate = (fat * 6.6) + (snf * 2.2);
    if (rate < 40) rate = 40;
  }

  const total = qty * rate;

  // Update Slip Elements
  const slipType = document.getElementById('slip-type');
  const slipQty = document.getElementById('slip-qty');
  const slipFatSnf = document.getElementById('slip-fatsnf');
  const slipRate = document.getElementById('slip-rate');
  const slipTotal = document.getElementById('slip-total');

  if (slipType) slipType.textContent = milkType === 'cow' ? 'Cow (गाय)' : 'Buffalo (म्हैस)';
  if (slipQty) slipQty.textContent = `${qty.toFixed(2)} Ltr`;
  if (slipFatSnf) slipFatSnf.textContent = `${fat.toFixed(1)}% / ${snf.toFixed(1)}`;
  if (slipRate) slipRate.textContent = `₹ ${rate.toFixed(2)}`;
  if (slipTotal) slipTotal.textContent = `₹ ${total.toFixed(2)}`;
}

/**
 * Handle Booking Form Submission inside Modal
 */
function handleClaimForm(e) {
  e.preventDefault();

  const dairy = document.getElementById('form-dairy')?.value.trim() || '';
  const name = document.getElementById('form-name')?.value.trim() || '';
  const phone = document.getElementById('form-phone')?.value.trim() || '';
  const location = document.getElementById('form-location')?.value.trim() || '';

  if (!dairy || !name || !phone) {
    alert('Please fill in all required fields.');
    return;
  }

  // Format WhatsApp message
  const message = `Hello Nitsa IT Solutions,
I want to book the Dairy Management Software for the Special Offer of ₹499/Year!

Details:
• Dairy Name: ${dairy}
• Owner Name: ${name}
• Phone: ${phone}
• Location: ${location}
• Plan: 1-Year Full License @ ₹499`;

  const waUrl = `https://wa.me/919834842218?text=${encodeURIComponent(message)}`;

  // Show success box
  const successBox = document.getElementById('booking-success');
  const successWaLink = document.getElementById('success-wa-link');
  const form = document.getElementById('claim-form');

  if (successBox && successWaLink) {
    successWaLink.href = waUrl;
    successBox.classList.remove('hidden');
    if (form) form.classList.add('hidden');
  }

  // Also open WhatsApp in new tab automatically
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 600);
}
