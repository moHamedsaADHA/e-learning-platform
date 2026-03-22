import React, { useMemo } from 'react';

// رموز وعمليات رياضية مختلفة - خارج المكون لتجنب إعادة الإنشاء
const mathSymbols = [
  '∫', '∑', '∏', '√', '∞', 'π', 'α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ψ', 'ω',
  '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', '∇', '∴', '∵', '∈', '∉', '⊂', '⊃', '∪', '∩',
  'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'lim', 'dx', 'dy', 'f(x)', 'g(x)', 'h(x)',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '=', '(', ')', '[', ']',
  'x²', 'x³', 'x⁴', 'y²', 'z²', 'a²', 'b²', 'c²', 'n!', 'Σx', '∆x', '∆y'
];

const MathBackground = () => {
  // إنشاء مصفوفة من الرموز بمواضع عشوائية - يتم تنفيذها مرة واحدة فقط
  const symbols = useMemo(() => {
    const symbolsArray = [];
    for (let i = 0; i < 80; i++) {
      const symbol = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 20 + 12; // حجم بين 12-32px
      const opacity = Math.random() * 0.3 + 0.1; // شفافية بين 0.1-0.4
      const rotation = Math.random() * 360;
      const delay = Math.random() * 10; // تأخير للحركة

      symbolsArray.push({
        id: i,
        symbol,
        x,
        y,
        size,
        opacity,
        rotation,
        delay
      });
    }
    return symbolsArray;
  }, []); // مصفوفة فارغة تعني أن هذا سيتم تنفيذه مرة واحدة فقط

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* خلفية متدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"></div>
      
      {/* شبكة رياضية خفيفة */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* الرموز الرياضية المتحركة */}
      {symbols.map((item) => (
        <div
          key={item.id}
          className="absolute animate-float text-blue-400 dark:text-blue-300 select-none font-mono font-bold"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
            transform: `rotate(${item.rotation}deg)`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        >
          {item.symbol}
        </div>
      ))}

      {/* معادلات رياضية كبيرة في الخلفية */}
      <div className="absolute top-10 left-10 text-6xl font-bold text-blue-200 dark:text-blue-800 opacity-20 transform rotate-12">
        ∫₀^∞ e^(-x²) dx = √π/2
      </div>
      <div className="absolute bottom-20 right-10 text-5xl font-bold text-purple-200 dark:text-purple-800 opacity-20 transform -rotate-12">
        E = mc²
      </div>
      <div className="absolute top-1/2 left-1/4 text-4xl font-bold text-green-200 dark:text-green-800 opacity-20 transform rotate-45">
        a² + b² = c²
      </div>
      <div className="absolute bottom-1/3 left-1/2 text-3xl font-bold text-indigo-200 dark:text-indigo-800 opacity-20 transform -rotate-30">
        lim(x→∞) f(x) = L
      </div>

      {/* دوائر هندسية متحركة */}
      <div className="absolute top-20 right-20 w-32 h-32 border-2 border-blue-200 dark:border-blue-700 rounded-full opacity-30 animate-spin-slow"></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 border-2 border-purple-200 dark:border-purple-700 rounded-full opacity-30 animate-bounce-gentle"></div>
      <div className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-green-200 dark:border-green-700 rounded-full opacity-30 animate-pulse"></div>
    </div>
  );
};

export default MathBackground;