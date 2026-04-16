import React from 'react';

const ManualModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlayFade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .manual-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.2s ease, background 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .manual-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
        }
        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, rgba(0,255,204,0.1), rgba(0,255,204,0.0));
          border: 1px solid rgba(0, 255, 204, 0.2);
          margin-bottom: 8px;
        }
        .modal-gradient-text {
          background: linear-gradient(90deg, #fff, #a0a0a0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5,5,5,0.95)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        animation: 'overlayFade 0.2s ease-out forwards'
      }} onClick={onClose}>
        <div style={{
          width: '800px', maxHeight: '85vh', overflowY: 'auto', overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch', padding: '40px', borderRadius: '24px', position: 'relative',
          color: 'var(--text-main)', background: '#0a0a0a',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)', border: '1px solid #1f1f1f',
          animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }} onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '24px', right: '32px',
            background: 'transparent', border: 'none', color: '#666',
            fontSize: '28px', cursor: 'pointer', transition: 'color 0.2s'
          }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#666'}>
            ✕
          </button>

          <h1 className="modal-gradient-text" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Jak z tego korzystać?
          </h1>
          <p style={{ fontSize: '15px', color: '#888', marginBottom: '32px', maxWidth: '620px', lineHeight: '1.6' }}>
            Wrzuć zadania i działaj. Planer sam ułoży je w czasie – Ty decydujesz kiedy coś zmienić.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(0, 255, 204, 0.3)' }}>➕</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Dodawanie zadań</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                W lewym panelu wpisz nazwę, czas trwania i priorytet. Możesz też użyć <strong>mikrofonu 🎙️</strong> i powiedzieć np. <em>„Trening 45 minut"</em> – planer sam to rozumie. Szybkie rutyny (Śniadanie, Trening…) dodasz jednym kliknięciem.
              </p>
            </div>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(255, 180, 0, 0.3)' }}>🖱️</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Przeciąganie kafelków</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                Złap dowolny kafelek i przeciągnij go wyżej lub niżej. Puść – wskoczy dokładnie co <strong>15 minut</strong> (snap-to-grid) i automatycznie zostanie <strong>przypięty</strong> w tym miejscu.
              </p>
            </div>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(255, 120, 0, 0.3)' }}>✏️</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Edycja w miejscu</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                <strong>Kliknij dwukrotnie na nazwę</strong> zadania by ją zmienić. Godziny (np. <em>10:00 – 11:00</em>) na każdym kafelku są klikalne – zmień je bezpośrednio bez wchodzenia w żadne menu.
              </p>
            </div>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(255, 180, 0, 0.3)' }}>📌</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Sztywne vs. Elastyczne</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                Zadania <strong>elastyczne</strong> planer układa sam w wolne luki. Kliknij 📌 lub podaj godzinę startu by zadanie stało się <strong>sztywne</strong> – będzie trzymać swoją godzinę niezależnie od reszty.
              </p>
            </div>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(255, 77, 77, 0.3)' }}>🚨</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Awaryjne opóźnienie</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                Zadzwonił szef? W lewym panelu naciśnij <strong>🚨 Awaryjne opóźnienie (+30m)</strong>. Planer wstawi blokadę od teraz i automatycznie dosunie pozostałe elastyczne zadania w dół.
              </p>
            </div>

            <div className="manual-card">
              <div className="icon-circle" style={{ borderColor: 'rgba(255, 77, 77, 0.3)' }}>🎮</div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: 0 }}>Punkty XP i poziomy</h3>
              <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                Każde odhaczone zadanie daje XP. Priorytet 1 (najważniejsze) daje najwięcej. Zbieraj XP i awansuj na wyższe poziomy – to działa motywująco nawet przy nudnych zadaniach!
              </p>
            </div>

            <div className="manual-card" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'flex-start', gap: '20px' }}>
              <div className="icon-circle" style={{ borderColor: 'rgba(0, 255, 204, 0.3)', width: '56px', height: '56px', fontSize: '28px', flexShrink: 0 }}>🍅</div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#eee', margin: '0 0 6px 0' }}>Pomodoro Timer i Tryb Zen</h3>
                <p style={{ fontSize: '13px', color: '#999', lineHeight: '1.6', margin: 0 }}>
                  Kliknij przycisk <strong>🍅</strong> w prawym dolnym rogu by otworzyć minutnik Pomodoro – działa w tle na każdym ekranie. Gdy chcesz skupić się na jednym zadaniu bez rozpraszaczy, włącz <strong>Tryb Zen 🧘</strong> (przycisk w górnym pasku). Znajdziesz tam wbudowany mikser dźwięków tła: Kawiarnia, Deszcz, Ognisko, Fale – stwórz swoje idealne środowisko pracy.
                </p>
              </div>
            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button onClick={onClose} style={{
              background: '#eee', color: '#000', padding: '14px 48px',
              borderRadius: '30px', fontWeight: '700', border: 'none', cursor: 'pointer',
              fontSize: '15px', transition: 'transform 0.2s, background 0.2s'
            }} onMouseOver={e => {e.target.style.transform='scale(1.05)'; e.target.style.background='#fff'}} onMouseOut={e => {e.target.style.transform='scale(1)'; e.target.style.background='#eee'}}>
              Zrozumiałem, bierzmy się do pracy!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManualModal;
