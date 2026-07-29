/**
 * GÖKTÜRK İLİK SİGORTA - Interactive Engine & WhatsApp Redirector
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const CONFIG = {
    whatsappPhone: "905075950731", // Göktürk İlik Sigorta WhatsApp No
    agencyName: "Göktürk İlik Sigorta"
  };

  // Splash Screen Handler
  const splashScreen = document.getElementById('introSplash');
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
    }, 2400);
  }

  // State Management
  let selectedInsuranceType = 'Trafik Sigortası';

  /* ==========================================================================
     Header Scroll & Mobile Navigation
     ========================================================================== */
  const header = document.querySelector('.header');
  const mobileToggler = document.querySelector('.mobile-toggler');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const toggleMobileMenu = (forceClose = false) => {
    if (!navLinks) return;
    
    if (forceClose || navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.style.overflow = '';
      if (mobileToggler) mobileToggler.querySelector('i').className = 'fas fa-bars';
    } else {
      navLinks.classList.add('active');
      if (navOverlay) navOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (mobileToggler) mobileToggler.querySelector('i').className = 'fas fa-times';
    }
  };

  if (mobileToggler) {
    mobileToggler.addEventListener('click', () => toggleMobileMenu());
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', () => toggleMobileMenu(true));
  }

  // Smooth Navigation Links
  document.querySelectorAll('.nav-link, a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          toggleMobileMenu(true);
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  /* ==========================================================================
     Insurance Type Selector (Pills)
     ========================================================================== */
  const typePills = document.querySelectorAll('.type-pill');
  const plakaGroup = document.getElementById('plakaGroup');
  const formTitle = document.getElementById('selectedFormTitle');

  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      selectedInsuranceType = pill.dataset.type;
      
      if (formTitle) {
        formTitle.textContent = `${selectedInsuranceType} Hızlı Teklif Al`;
      }

      // Show/Hide Plaka field dynamically based on Vehicle type
      if (selectedInsuranceType === 'Trafik Sigortası' || selectedInsuranceType === 'Kasko Sigortası') {
        if (plakaGroup) plakaGroup.style.display = 'block';
      } else {
        if (plakaGroup) plakaGroup.style.display = 'none';
      }
    });
  });

  /* ==========================================================================
     Form Input Auto-Formatting (Plaka & Phone)
     ========================================================================== */
  const plakaInput = document.getElementById('plakaInput');
  const phoneInput = document.getElementById('phoneInput');

  if (plakaInput) {
    plakaInput.addEventListener('input', (e) => {
      // Auto uppercase & trim spaces
      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (val.length > 8) val = val.substring(0, 8);
      e.target.value = val;
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      e.target.value = val;
    });
  }

  /* ==========================================================================
     Quote Form Submission & WhatsApp Yönlendirmesi
     ========================================================================== */
  const quoteForm = document.getElementById('quickQuoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('nameInput')?.value.trim() || 'Müşteri';
      const phoneVal = document.getElementById('phoneInput')?.value.trim() || '';
      const plakaVal = document.getElementById('plakaInput')?.value.trim() || '';
      const tcVal = document.getElementById('tcInput')?.value.trim() || '';
      const noteVal = document.getElementById('noteInput')?.value.trim() || '';

      if (!phoneVal) {
        alert('Lütfen teklif oluşturabilmemiz için telefon numaranızı giriniz.');
        return;
      }

      // Prepare Whatsapp Message text
      let textMessage = `*GÖKTÜRK İLİK SİGORTA TEKLİF TALEBİ*\n\n`;
      textMessage += `📌 *Sigorta Türü:* ${selectedInsuranceType}\n`;
      textMessage += `👤 *Ad Soyad / Unvan:* ${nameVal}\n`;
      textMessage += `📞 *Telefon:* ${phoneVal}\n`;
      
      if (plakaVal && (selectedInsuranceType === 'Trafik Sigortası' || selectedInsuranceType === 'Kasko Sigortası')) {
        textMessage += `🚗 *Araç Plakası:* ${plakaVal}\n`;
      }

      if (tcVal) {
        textMessage += `🆔 *TC / VKN No:* ${tcVal}\n`;
      }

      if (noteVal) {
        textMessage += `📝 *Not:* ${noteVal}\n`;
      }

      textMessage += `\nİyi çalışmalar, sigorta poliçesi ve prim teklifini rica ediyorum.`;

      const encodedMsg = encodeURIComponent(textMessage);
      const whatsappUrl = `https://wa.me/${CONFIG.whatsappPhone}?text=${encodedMsg}`;

      // Open Modal Feedback
      showSuccessModal(selectedInsuranceType, whatsappUrl);
    });
  }

  /* ==========================================================================
     FAQ Accordion Logic
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other active items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const body = otherItem.querySelector('.faq-body');
        if (body) body.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const body = item.querySelector('.faq-body');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ==========================================================================
     Success Modal Manager
     ========================================================================== */
  function showSuccessModal(type, redirectUrl) {
    let modalBackdrop = document.getElementById('successModal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'successModal';
      modalBackdrop.className = 'modal-backdrop';
      modalBackdrop.innerHTML = `
        <div class="modal-card">
          <div class="modal-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Teklif Talebiniz Hazır!</h3>
          <p style="color: var(--text-muted); margin: 0.75rem 0 1.5rem 0;">
            <strong>${type}</strong> için hazırlanan talebiniz onaylandı. Anında WhatsApp hattımıza aktarılıyorsunuz.
          </p>
          <a href="${redirectUrl}" target="_blank" class="btn btn-whatsapp" id="modalRedirectBtn" style="width: 100%;">
            <i class="fab fa-whatsapp"></i> WhatsApp'ta Aç &amp; Teklifi Al
          </a>
          <button class="btn btn-outline" id="closeModalBtn" style="width: 100%; margin-top: 0.75rem;">
            Kapat
          </button>
        </div>
      `;
      document.body.appendChild(modalBackdrop);

      document.getElementById('closeModalBtn').addEventListener('click', () => {
        modalBackdrop.classList.remove('active');
      });
    } else {
      const redirectBtn = document.getElementById('modalRedirectBtn');
      if (redirectBtn) redirectBtn.href = redirectUrl;
    }

    setTimeout(() => {
      modalBackdrop.classList.add('active');
    }, 50);

    // Auto open WhatsApp window after 1.2s
    setTimeout(() => {
      window.open(redirectUrl, '_blank');
    }, 1200);
  }
});
