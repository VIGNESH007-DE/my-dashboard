import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Mock Data (Simulating Firestore Database) ---
const initialMockUser = {
  id: 'USER_12345',
  name: 'Suryakanta Mohanty',
  meterId: 'METER_ABC_987',
  wallet_balance: 142.50,
};

const initialMockTransactions = [
  { id: 'T1', date: '25-09-2025', amount: 200, units: 95.2 },
  { id: 'T2', date: '15-09-2025', amount: 300, units: 142.8 },
  { id: 'T3', date: '02-09-2025', amount: 150, units: 71.4 },
  { id: 'T4', date: '20-08-2025', amount: 500, units: 238.1 },
];

const initialMockTelemetry = {
  daily: [
    { date: '2025-09-21', usage: 4.5 }, { date: '2025-09-22', usage: 5.1 },
    { date: '2025-09-23', usage: 4.8 }, { date: '2025-09-24', usage: 5.5 },
    { date: '2025-09-25', usage: 4.2 }, { date: '2025-09-26', usage: 6.0 },
    { date: '2025-09-27', usage: 5.3 },
  ],
  weekly: [
    { week: 'Aug W4', usage: 35.2 }, { week: 'Sep W1', usage: 38.9 },
    { week: 'Sep W2', usage: 36.5 }, { week: 'Sep W3', usage: 40.1 },
  ],
};

const initialMockAlerts = [
  { id: 'A1', type: 'warning', message: 'Low Balance! Please recharge soon.' },
  { id: 'A2', type: 'info', message: 'Scheduled maintenance on Oct 5th, 10 PM.' },
  { id: 'A3', type: 'danger', message: 'Unusual usage pattern detected on Sep 26th.' },
];

const rechargePlans = [
    { amount: 100, units: 47.6, validity: '15 Days', processingTime: 12000 }, // 12 seconds
    { amount: 200, units: 95.2, validity: '30 Days', processingTime: 10000 }, // 10 seconds
    { amount: 500, units: 238.1, validity: '60 Days', processingTime: 15000 }, // 15 seconds
    { amount: 1000, units: 476.2, validity: '90 Days', popular: true, processingTime: 10000 }, // 10 seconds
];

// --- Translation Strings ---
const translations = {
  en: {
    dashboardTitle: 'My Dashboard',
    currentBalance: 'Current Balance',
    rechargeNow: 'Recharge Now',
    rechargeHistory: 'Recharge History',
    date: 'Date',
    amount: 'Amount',
    units: 'Units',
    energyUsage: 'Energy Usage',
    live: 'Live',
    daily: 'Daily',
    weekly: 'Weekly',
    kwh: 'kWh',
    alerts: 'Alerts & Notifications',
    feedbackTitle: 'Feedback & Complaints',
    subject: 'Subject',
    subjectPlaceholder: 'e.g., Meter not working',
    description: 'Description',
    descriptionPlaceholder: 'Please describe your issue in detail...',
    submit: 'Submit Feedback',
    feedbackSuccess: 'Feedback submitted successfully!',
    english: 'English',
    odia: 'Odia',
    rechargeModalTitle: 'Recharge Your Meter',
    choosePlan: 'Choose a Recharge Plan',
    generateQR: 'Proceed to Pay',
    scanToPay: 'Scan QR to Pay',
    qrExpiresIn: 'QR code expires in',
    rechargeSuccessful: 'Recharge Successful!',
    rechargeFailed: 'Processing payment securely...',
    updatedBalance: 'Your updated balance is',
    close: 'Close',
    popular: 'Popular',
    validity: 'Validity'
  },
  or: {
    dashboardTitle: 'ମୋର ଡାସବୋର୍ଡ',
    currentBalance: 'ବର୍ତ୍ତମାନର ବାଲାନ୍ସ',
    rechargeNow: 'ବର୍ତ୍ତମାନ ରିଚାର୍ଜ କରନ୍ତୁ',
    rechargeHistory: 'ରିଚାର୍ଜ ଇତିହାସ',
    date: 'ତାରିଖ',
    amount: 'ରାଶି',
    units: 'ୟୁନିଟ୍',
    energyUsage: 'ଶକ୍ତି ବ୍ୟବହାର',
    live: 'ଲାଇଭ୍',
    daily: 'ଦୈନିକ',
    weekly: 'ସାପ୍ତାହିକ',
    kwh: 'kWh',
    alerts: 'ସତର୍କତା ଏବଂ ସୂଚନା',
    feedbackTitle: 'ମତାମତ ଏବଂ ଅଭିଯୋଗ',
    subject: 'ବିଷୟ',
    subjectPlaceholder: 'ଉଦାହରଣ: ମିଟର କାମ କରୁନାହିଁ',
    description: 'ବିବରଣୀ',
    descriptionPlaceholder: 'ଦୟାକରି ଆପଣଙ୍କ ସମସ୍ୟା ବିସ୍ତାରରେ ବର୍ଣ୍ଣନା କରନ୍ତୁ...',
    submit: 'ମତାମତ ଦାଖଲ କରନ୍ତୁ',
    feedbackSuccess: 'ମତାମତ ସଫଳତାର ସହିତ ଦାଖଲ ହେଲା!',
    english: 'ଇଂରାଜୀ',
    odia: 'ଓଡ଼ିଆ',
    rechargeModalTitle: 'ଆପଣଙ୍କ ମିଟର ରିଚାର୍ଜ କରନ୍ତୁ',
    choosePlan: 'ଏକ ରିଚାର୍ଜ ପ୍ଲାନ୍ ବାଛନ୍ତୁ',
    generateQR: 'ପେମେଣ୍ଟ କରିବାକୁ ଆଗକୁ ବଢନ୍ତୁ',
    scanToPay: 'ପେମେଣ୍ଟ ପାଇଁ QR ସ୍କାନ୍ କରନ୍ତୁ',
    qrExpiresIn: 'QR କୋଡ୍ ଏଥିରେ ସମାପ୍ତ ହେବ',
    rechargeSuccessful: 'ରିଚାର୍ଜ ସଫଳ ହେଲା!',
    rechargeFailed: 'ପେମେଣ୍ଟ ସୁରକ୍ଷିତ ଭାବରେ ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...',
    updatedBalance: 'ଆପଣଙ୍କର ଅପଡେଟ୍ ହୋଇଥିବା ବାଲାନ୍ସ ହେଉଛି',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
    popular: 'ଲୋକପ୍ରିୟ',
    validity: 'ବୈଧତା'
  },
};

// --- Helper Components ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 w-full ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-800 mb-4">{children}</h2>
);

// --- Main App Component ---
export default function App() {
  const [lang, setLang] = useState('or');
  const [user, setUser] = useState(initialMockUser);
  const [transactions, setTransactions] = useState(initialMockTransactions);
  const [chartView, setChartView] = useState('live');
  const [feedback, setFeedback] = useState({ subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChartJsLoaded, setIsChartJsLoaded] = useState(false);

  useEffect(() => {
    if (window.Chart) {
        setIsChartJsLoaded(true);
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => setIsChartJsLoaded(true);
    script.onerror = () => console.error('Chart.js script could not be loaded.');
    document.body.appendChild(script);

    return () => {
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    };
  }, []);

  const t = translations[lang];

  const handleLanguageToggle = () => setLang(current => (current === 'en' ? 'or' : 'en'));

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.subject || !feedback.description) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback({ subject: '', description: '' });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 1000);
  };

  const handleRechargeSuccess = useCallback((rechargeAmount) => {
    const plan = rechargePlans.find(p => p.amount === rechargeAmount);
    const units = plan ? plan.units : parseFloat((rechargeAmount / 2.1).toFixed(1));
    
    setUser(currentUser => ({...currentUser, wallet_balance: currentUser.wallet_balance + rechargeAmount }));

    const newTransaction = {
      id: `T${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      amount: rechargeAmount,
      units: units
    };
    setTransactions(currentTxs => [newTransaction, ...currentTxs]);
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">{t.dashboardTitle}</h1>
          <div className="flex items-center space-x-3">
             <button onClick={handleLanguageToggle} className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-all duration-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
               <span>{lang === 'en' ? t.odia : t.english}</span>
             </button>
             <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-500"/>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-2xl p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className='text-center sm:text-left'>
                <p className="text-lg font-medium opacity-80">{t.currentBalance}</p>
                <p className="text-5xl font-extrabold tracking-tight mt-1">₹{user.wallet_balance.toFixed(2)}</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                {t.rechargeNow}
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <SectionTitle>{t.rechargeHistory}</SectionTitle>
              <div className="overflow-y-auto h-64 pr-2">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-2 px-3 font-semibold text-gray-600">{t.date}</th>
                      <th className="py-2 px-3 font-semibold text-gray-600 text-right">{t.amount} (₹)</th>
                      <th className="py-2 px-3 font-semibold text-gray-600 text-right">{t.units}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 px-3">{tx.date}</td>
                        <td className="py-3 px-3 text-right font-medium text-green-600">+{tx.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-gray-700">{tx.units.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
                <SectionTitle>{t.alerts}</SectionTitle>
                <div className="space-y-3 h-64 overflow-y-auto pr-2">
                    {initialMockAlerts.map(alert => <Alert key={alert.id} type={alert.type} message={alert.message} />)}
                </div>
            </Card>
        </div>

        <Card>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <SectionTitle>{t.energyUsage}</SectionTitle>
                <div className="flex items-center bg-gray-100 rounded-lg p-1 self-start sm:self-center">
                    {['live', 'daily', 'weekly'].map(view => (
                        <button key={view} onClick={() => setChartView(view)} className={`capitalize px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${chartView === view ? 'bg-indigo-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                           {t[view]}
                        </button>
                    ))}
                </div>
            </div>
            <EnergyChart chartView={chartView} langKey={lang} isChartJsLoaded={isChartJsLoaded} />
        </Card>

        <Card>
            <SectionTitle>{t.feedbackTitle}</SectionTitle>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                 <input type="text" name="subject" value={feedback.subject} onChange={handleFeedbackChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.subjectPlaceholder} required />
                 <textarea name="description" rows="4" value={feedback.description} onChange={handleFeedbackChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder={t.descriptionPlaceholder} required></textarea>
                 <div className="text-right">
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                        {isSubmitting ? 'Submitting...' : t.submit}
                    </button>
                 </div>
            </form>
        </Card>
      </main>

       {showSuccessToast && <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-xl animate-bounce">{t.feedbackSuccess}</div>}
       <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRechargeSuccess={handleRechargeSuccess} translations={t} user={user} />
    </div>
  );
}

// --- Sub-Components ---
const PaymentSuccessAnimation = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .success-animation-container { position: relative; width: 150px; height: 150px; margin: 0 auto; }
            .boom-circle {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-color: #22c55e; /* green-500 */
                border-radius: 50%;
                transform: scale(0);
                opacity: 0.5;
                animation: boom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }
            .checkmark-svg {
                width: 100%; height: 100%;
                transform: scale(0);
                animation: scale-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.3s forwards;
            }
            .checkmark-circle {
                stroke-dasharray: 166; stroke-dashoffset: 166;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards;
            }
            .checkmark-check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48; stroke-dashoffset: 48;
                animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 1s forwards;
            }
            .confetti {
                position: absolute; top: 50%; left: 50%;
                width: 10px; height: 10px;
                background-color: var(--color);
                opacity: 0;
                animation: confetti-fly 1.2s ease-out 0.5s forwards;
            }
            @keyframes boom {
                0% { transform: scale(0); opacity: 0.8; }
                50% { opacity: 0.3; }
                100% { transform: scale(2.5); opacity: 0; }
            }
            @keyframes scale-in {
                100% { transform: scale(1); }
            }
            @keyframes stroke { 100% { stroke-dashoffset: 0; } }
            @keyframes confetti-fly {
                0% { transform: translate(-50%, -50%) rotate(0) scale(1); opacity: 1; }
                100% { transform: translate(var(--x), var(--y)) rotate(360deg) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        return () => { if(document.head.contains(style)) document.head.removeChild(style); };
    }, []);

    const confettiParticles = Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * 360;
        const radius = Math.random() * 120 + 50;
        const x = Math.cos(angle * (Math.PI / 180)) * radius;
        const y = Math.sin(angle * (Math.PI / 180)) * radius;
        const colors = ['#f43f5e', '#3b82f6', '#eab308', '#8b5cf6', '#14b8a6'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const style = {
            '--color': color,
            '--x': `${x}px`,
            '--y': `${y}px`,
        };
        return <div key={i} className="confetti" style={style}></div>;
    });

    return (
        <div className="success-animation-container my-4">
            <div className="boom-circle"></div>
            {confettiParticles}
            <svg className="checkmark-svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle text-green-500" cx="26" cy="26" r="25" fill="none" strokeWidth="4"/>
                <path className="checkmark-check text-white" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="5"/>
            </svg>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, onRechargeSuccess, translations: t, user }) => {
    const [step, setStep] = useState('amount'); // amount, qr, success
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [timer, setTimer] = useState(300);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('amount');
                setSelectedPlan(null);
                setTimer(300);
            }, 300); // Reset after modal close animation
            return;
        }

        let countdown;
        if (step === 'qr' && selectedPlan) {
            countdown = setInterval(() => setTimer(prev => prev <= 1 ? 0 : prev - 1), 1000);
            const paymentTimeout = setTimeout(() => {
                onRechargeSuccess(selectedPlan.amount);
                setStep('success');
            }, selectedPlan.processingTime); // Use dynamic time from plan

            return () => {
                clearInterval(countdown);
                clearTimeout(paymentTimeout);
            };
        }
    }, [isOpen, step, onClose, onRechargeSuccess, selectedPlan]);

    const handleGenerateQR = (e) => {
        e.preventDefault();
        if (selectedPlan) setStep('qr');
    };
    
    if (!isOpen) return null;

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    const qrData = selectedPlan ? encodeURIComponent(`upi://pay?pa=user@okbank&pn=${user.name}&am=${selectedPlan.amount}&cu=INR`) : '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center transform transition-all duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-3xl leading-none">&times;</button>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{step === 'amount' ? t.choosePlan : t.rechargeModalTitle}</h3>
                
                {step === 'amount' && (
                    <form onSubmit={handleGenerateQR}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {rechargePlans.map(plan => (
                                <div key={plan.amount} onClick={() => setSelectedPlan(plan)} className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan?.amount === plan.amount ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}>
                                    {plan.popular && <div className="absolute top-[-10px] right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{t.popular}</div>}
                                    <p className="text-2xl font-bold">₹{plan.amount}</p>
                                    <p className="text-sm text-gray-600">{plan.units} {t.units}</p>
                                    <p className="text-xs text-gray-500 mt-1">{t.validity}: {plan.validity}</p>
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={!selectedPlan} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">{t.generateQR}</button>
                    </form>
                )}

                {step === 'qr' && (
                    <div className="space-y-4 animate-fade-in">
                        <p className="font-semibold">{t.scanToPay} ₹{selectedPlan.amount}</p>
                        <img src={qrUrl} alt="QR Code" className="mx-auto rounded-lg border-4 border-gray-200" />
                        <div className="bg-yellow-100 text-yellow-800 font-bold py-2 px-4 rounded-lg">
                            {t.qrExpiresIn}: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                        <p className="text-sm text-gray-500 pt-4 animate-pulse">{t.rechargeFailed}</p>
                    </div>
                )}
                
                {step === 'success' && (
                    <div className="space-y-2 animate-fade-in">
                        <PaymentSuccessAnimation />
                        <h4 className="text-2xl font-bold text-green-600">{t.rechargeSuccessful}</h4>
                        <p className="text-gray-600 text-lg">{t.updatedBalance} <span className="font-bold">₹{user.wallet_balance.toFixed(2)}</span></p>
                        <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 mt-4">{t.close}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EnergyChart = ({ chartView, langKey, isChartJsLoaded }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!isChartJsLoaded || !window.Chart || !chartRef.current) {
            return;
        }

        const ctx = chartRef.current.getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        let data, labels;
        
        if (chartView === 'live') {
            const initialLabels = Array.from({length: 5}, (_, i) => new Date(Date.now() - (4-i)*5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}));
            const initialData = Array.from({length: 5}, () => (Math.random() * 2 + 3).toFixed(2));
            labels = initialLabels;
            data = initialData;
        } else {
            const telemetryData = chartView === 'daily' ? initialMockTelemetry.daily : initialMockTelemetry.weekly;
            labels = telemetryData.map(d => chartView === 'daily' ? new Date(d.date).toLocaleDateString(langKey === 'or' ? 'or-IN' : 'en-US', { day: 'numeric', month: 'short'}) : d.week);
            data = telemetryData.map(d => d.usage);
        }
        
        chartInstance.current = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: translations[langKey].kwh,
                    data: data,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointRadius: chartView === 'live' ? 0 : 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.2)' }, ticks: { callback: (v) => `${v} ${translations[langKey].kwh}` } },
                    x: { grid: { display: false } }
                }
            }
        });
        
        let intervalId;
        if(chartView === 'live') {
            intervalId = setInterval(() => {
                if(chartInstance.current) {
                    const chart = chartInstance.current;
                    chart.data.labels.push(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}));
                    chart.data.datasets[0].data.push((Math.random() * 3 + 4).toFixed(2));
                    
                    if (chart.data.labels.length > 12) {
                        chart.data.labels.shift();
                        chart.data.datasets[0].data.shift();
                    }
                    chart.update();
                }
            }, 5000);
        }
        
        return () => {
            clearInterval(intervalId);
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [chartView, langKey, isChartJsLoaded]);

    if (!isChartJsLoaded) {
        return <div className="h-80 flex items-center justify-center text-gray-500">Loading Chart...</div>;
    }

    return <div className="h-80"><canvas ref={chartRef}></canvas></div>;
};

const Alert = ({ type, message }) => {
  const styles = {
    info: { bg: 'bg-blue-100', border: 'border-blue-500', iconColor: 'text-blue-500', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
    warning: { bg: 'bg-yellow-100', border: 'border-yellow-500', iconColor: 'text-yellow-500', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    danger: { bg: 'bg-red-100', border: 'border-red-500', iconColor: 'text-red-500', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  };
  const currentStyle = styles[type] || styles.info;
  return (
    <div className={`flex items-start p-3 rounded-lg border-l-4 ${currentStyle.bg} ${currentStyle.border}`}>
      <div className={`flex-shrink-0 mr-3 ${currentStyle.iconColor}`}>{currentStyle.icon}</div>
      <p className="text-sm text-gray-800">{message}</p>
    </div>
  );
};

