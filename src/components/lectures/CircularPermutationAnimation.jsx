import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';

export default function CircularPermutationAnimation() {
  // Seats are fixed at 12, 3, 6, 9 o'clock positions
  const seatPositions = [
    { x: 150, y: 50 },  // Top
    { x: 250, y: 150 }, // Right
    { x: 150, y: 250 }, // Bottom
    { x: 50, y: 150 }   // Left
  ];

  const [order, setOrder] = useState(['A', 'B', 'C', 'D']);
  const [rotationCount, setRotationCount] = useState(0);

  const rotateSeats = () => {
    // Shift names: [A,B,C,D] -> [D,A,B,C]
    setOrder(prev => {
      const newOrder = [...prev];
      const last = newOrder.pop();
      newOrder.unshift(last);
      return newOrder;
    });
    setRotationCount(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-800">원순열: 고정된 자리에 앉기</h3>
        <p className="text-sm text-gray-500 mt-1">자리는 고정되어 있고, 사람(문자)만 옆자리로 이동합니다.</p>
      </div>

      <div className="relative">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Static Table */}
          <circle cx="150" cy="150" r="80" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
          <text x="150" y="155" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">FIXED TABLE</text>

          {/* Fixed Chairs */}
          {seatPositions.map((pos, i) => (
            <circle key={`chair-${i}`} cx={pos.x} cy={pos.y} r="25" fill="white" stroke="#cbd5e1" strokeWidth="2" />
          ))}

          {/* Moving People (Letters) */}
          <AnimatePresence mode="popLayout">
            {order.map((name, i) => (
              <motion.text
                key={name}
                layoutId={name}
                x={seatPositions[i].x}
                y={seatPositions[i].y + 7}
                textAnchor="middle"
                fill="#2563eb"
                fontSize="22"
                fontWeight="black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {name}
              </motion.text>
            ))}
          </AnimatePresence>
        </svg>
      </div>

      <div className="mt-10 flex flex-col items-center gap-6">
        <button 
          onClick={rotateSeats}
          className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md active:bg-blue-800 transition-colors"
        >
          <RotateCw size={20} /> 다음 자리로 이동 (90도 회전)
        </button>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-200 text-xs font-bold text-gray-600">
            회전 횟수: {rotationCount}회
          </div>
          <div className="px-4 py-2 bg-blue-50 rounded-md border border-blue-100 text-xs font-bold text-blue-700">
            {rotationCount % 4 === 0 ? "기준 상태와 동일" : "회전 상태 (상대 위치 동일)"}
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center max-w-sm leading-relaxed">
          사람이 옆자리로 옮겨가도 <span className="text-blue-600 font-bold">A의 오른쪽엔 항상 B, 왼쪽엔 항상 D</span>가 앉아 있습니다. <br/>
          따라서 이 모든 경우는 수학적으로 <span className="underline decoration-blue-500 font-bold">하나의 경우</span>로 칩니다.
        </p>
      </div>
    </div>
  );
}
