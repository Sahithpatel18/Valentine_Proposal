
import React, { useState, useEffect, useRef } from 'react';
import FloatingHearts from './components/FloatingHearts';
import HeartConfetti from './components/HeartConfetti';
import { ProposalData, LoveLetterResponse } from './types';
import { generateLoveContent } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'proposing' | 'success'>('setup');
  const [data, setData] = useState<ProposalData>({ recipientName: '', senderName: '', photo: '' });
  const [loveContent, setLoveContent] = useState<LoveLetterResponse | null>(null);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isNoButtonActive, setIsNoButtonActive] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

// telegram start here 
// 📲 Telegram Notification Function
// 📲 Telegram Notification via Backend API
const sendTelegramNotification = async (
  recipientName: string,
  senderName: string
) => {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientName,
        senderName,
      }),
    });

    console.log("Telegram notification sent via backend ✅");
  } catch (error) {
    console.error("Telegram backend error ❌", error);
  }
};



  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNoHover = () => {
    const randomX = Math.max(20, Math.random() * (window.innerWidth - 150));
    const randomY = Math.max(20, Math.random() * (window.innerHeight - 100));
    setNoButtonPos({ x: randomX, y: randomY });
    setIsNoButtonActive(true);
  };

  const triggerNotification = () => {
    const title = "💖 Proposal Accepted!";
    const options = {
      body: `${data.recipientName} said YES to ${data.senderName}!`,
      icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
      badge: "https://cdn-icons-png.flaticon.com/512/833/833472.png"
    };

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, options);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(title, options);
          }
        });
      }
    }
    
    // Show a visual toast in the UI as well for immediate feedback
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 5000);
  };

  // const handleYes = async () => {
  //   setIsLoading(true);
  //   setStep('success');
  //   triggerNotification();
  //   try {
  //     const content = await generateLoveContent(data.recipientName, data.senderName);
  //     setLoveContent(content);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleYes = async () => {
  setIsLoading(true);
  setStep('success');

  // 🔔 Browser notification
  triggerNotification();

  // 📲 Telegram notification (ADD THIS LINE)
  sendTelegramNotification(
    data.recipientName,
    data.senderName
  );

  try {
    const content = await generateLoveContent(
      data.recipientName,
      data.senderName
    );
    setLoveContent(content);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
};


  const startProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data.recipientName && data.senderName) {
      // Request permission on first button click to comply with browser user-gesture requirements
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      setStep('proposing');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-white to-red-100 overflow-hidden">
      <FloatingHearts />
      {step === 'success' && <HeartConfetti />}
      
      {/* Visual Toast Notification confirming the Sender was alerted */}
      {showNotificationToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-full duration-500">
          <div className="bg-white/95 backdrop-blur-md border-2 border-green-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-l-[12px]">
            <div className="text-3xl animate-bounce">🔔</div>
            <div>
              <p className="font-bold text-slate-800 leading-tight text-sm">Acceptance Notified!</p>
              <p className="text-xs text-slate-500">A message has been sent to {data.senderName}.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 1: Input Names & Photo Upload */}
      {step === 'setup' && (
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-pink-200 z-10 transition-all duration-500 animate-in fade-in zoom-in">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-4xl shadow-inner">💝</div>
          </div>
          <h1 className="text-4xl font-logo text-red-500 text-center mb-8">Valentine Magic</h1>
          <form onSubmit={startProposal} className="space-y-5">
            <div className="flex flex-col items-center mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full border-4 border-dashed border-pink-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-pink-50 transition-colors relative group"
              >
                {data.photo ? (
                  <img src={data.photo} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center text-pink-400 p-2">
                    <span className="text-2xl block">+</span>
                    <span className="text-[10px] uppercase font-bold">Upload Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
              </div>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Her Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white shadow-sm"
                  placeholder="Recipient's Name"
                  value={data.recipientName}
                  onChange={(e) => setData({ ...data, recipientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Your Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white shadow-sm"
                  placeholder="Sender's Name"
                  value={data.senderName}
                  onChange={(e) => setData({ ...data, senderName: e.target.value })}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 mt-4"
            >
              Start Proposal 💖
            </button>
          </form>
        </div>
      )}

      {/* Step 2: The Proposal Page */}
      {step === 'proposing' && (
        <div className="flex flex-col items-center z-10 text-center px-4 max-w-2xl">
          <div className="mb-8 relative">
            <div className="absolute -inset-4 bg-white/50 blur-xl rounded-full"></div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 text-4xl animate-bounce">💌</div>
              <img 
                src={data.photo || "https://picsum.photos/seed/valentine/600/600"} 
                alt="My Valentine" 
                className="rounded-full shadow-[0_0_50px_rgba(239,68,68,0.3)] border-8 border-white h-64 w-64 md:h-80 md:w-80 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                For {data.recipientName}
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-handwritten text-red-600 mb-12 drop-shadow-lg leading-tight">
            My dearest {data.recipientName},<br />
            Will you be my Valentine?
          </h2>

          <div className="flex flex-wrap gap-8 items-center justify-center relative w-full min-h-[100px]">
            <button
              onClick={handleYes}
              className="px-14 py-6 bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white rounded-full text-3xl font-bold shadow-2xl transition-all transform hover:scale-125 hover:rotate-2 active:scale-90 z-20"
            >
              YES! 💍
            </button>

            <button
              onMouseEnter={handleNoHover}
              onClick={handleNoHover}
              style={isNoButtonActive ? {
                position: 'fixed',
                left: noButtonPos.x,
                top: noButtonPos.y,
                zIndex: 100,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              } : {}}
              className="px-10 py-4 bg-slate-400 hover:bg-slate-500 text-white rounded-full text-xl font-bold shadow-lg whitespace-nowrap"
            >
              No 😢
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Acceptance & Celebration Screen */}
      {step === 'success' && (
        <div className="bg-white/95 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl w-full max-w-2xl border-b-8 border-red-500 z-10 transition-all duration-700 animate-in fade-in slide-in-from-bottom-20 overflow-y-auto max-h-[90vh]">
          <div className="text-center mb-8 relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-8xl animate-pulse">🥰</div>
            <h1 className="text-5xl md:text-6xl font-logo text-red-500 mb-4 pt-4 animate-bounce">It's a YES!</h1>
            <div className="h-1 w-24 bg-pink-200 mx-auto rounded-full mb-6"></div>
          </div>

          <div className="space-y-8 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-red-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs">❤️</div>
                </div>
                <p className="mt-6 text-slate-500 font-medium animate-pulse text-lg">Writing a special letter from {data.senderName}...</p>
              </div>
            ) : (
              loveContent && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className="relative mb-10 group">
                    <div className="absolute -left-4 -top-4 text-4xl opacity-20">"</div>
                    <div className="absolute -right-4 -bottom-4 text-4xl opacity-20">"</div>
                    <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-3xl border border-pink-100 shadow-inner group-hover:scale-[1.02] transition-transform">
                      <pre className="whitespace-pre-wrap font-handwritten text-2xl md:text-3xl leading-relaxed text-red-700 italic">
                        {loveContent.poem}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="prose prose-pink max-w-none text-left px-4">
                    <p className="text-xl font-light leading-relaxed text-slate-700 first-letter:text-5xl first-letter:font-serif first-letter:text-red-500 first-letter:mr-3 first-letter:float-left">
                      {loveContent.message}
                    </p>
                  </div>

                  <div className="mt-12 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 transform hover:scale-110 transition-transform cursor-pointer">
                       <img src={data.photo || "https://picsum.photos/seed/valentine/200/200"} className="w-full h-full object-cover" alt="Recipient" />
                    </div>
                    <p className="text-4xl font-handwritten text-red-600">
                      Forever yours,<br />
                      <span className="text-2xl font-logo text-pink-500">{data.senderName}</span>
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            <button
              onClick={() => {
                setStep('setup');
                setLoveContent(null);
                setIsNoButtonActive(false);
              }}
              className="px-8 py-3 bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold rounded-2xl transition-colors flex items-center gap-2 group"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500">🔄</span> Create New Magic
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
