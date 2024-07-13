import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const filterTypes = ['LowShelf', 'Lowpass', 'Bell', 'Highpass', 'HighShelf'];

const initialBands = [
  { id: 1, frequency: 100, gain: 0, q: 1, type: 'LowShelf', color: '#ff4136' },
  { id: 2, frequency: 250, gain: 0, q: 1, type: 'Bell', color: '#ff851b' },
  { id: 3, frequency: 500, gain: 0, q: 1, type: 'Bell', color: '#ffdc00' },
  { id: 4, frequency: 1000, gain: 0, q: 1, type: 'Bell', color: '#2ecc40' },
  { id: 5, frequency: 2500, gain: 0, q: 1, type: 'Bell', color: '#0074d9' },
  { id: 6, frequency: 10000, gain: 0, q: 1, type: 'HighShelf', color: '#b10dc9' },
];

const Equalizer = () => {
  const [bands, setBands] = useState(initialBands);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    console.log('Bands updated:', bands);
    drawEQCurve();
  }, [bands]);

  const handleBandChange = (id, property, value) => {
    console.log(`Changing ${property} to ${value} for band ${id}`);
    setBands(prevBands => prevBands.map(band =>
      band.id === id ? { ...band, [property]: property === 'type' ? value : parseFloat(value) } : band
    ));
  };

  const frequencyToPosition = (freq) => {
    const minFreq = Math.log10(20);
    const maxFreq = Math.log10(20000);
    const range = maxFreq - minFreq;
    return (Math.log10(freq) - minFreq) / range;
  };

  const positionToFrequency = (pos) => {
    const minFreq = Math.log10(20);
    const maxFreq = Math.log10(20000);
    const range = maxFreq - minFreq;
    return Math.pow(10, minFreq + pos * range);
  };

  const handleDragStart = (e, id) => {
    e.preventDefault();
    const initialX = e.clientX;
    const initialY = e.clientY;
    const band = bands.find(b => b.id === id);
    const initialFreq = band.frequency;
    const initialGain = band.gain;

    const handleDrag = (moveEvent) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = moveEvent.clientX - initialX;
      const deltaY = initialY - moveEvent.clientY;

      const frequencyRange = Math.log10(20000) - Math.log10(20);
      const newFreq = Math.max(20, Math.min(20000, Math.pow(10, Math.log10(initialFreq) + (deltaX / rect.width) * frequencyRange)));
      const newGain = Math.max(-12, Math.min(12, initialGain + (deltaY / rect.height) * 24));

      handleBandChange(id, 'frequency', newFreq);
      handleBandChange(id, 'gain', newGain);
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const drawEQCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw grid and labels
    ctx.strokeStyle = '#444444';
    ctx.fillStyle = '#888888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';

    // Frequency grid lines and labels
    const freqLabels = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    freqLabels.forEach(freq => {
      const x = frequencyToPosition(freq) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(freq >= 1000 ? `${freq/1000}k` : freq, x, height - 5);
    });

    // dB grid lines and labels
    for (let db = -12; db <= 12; db += 3) {
      const y = (1 - (db + 12) / 24) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${db > 0 ? '+' : ''}${db}`, width - 5, y + 3);
    }    
    
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x++) {
      const freq = positionToFrequency(x / width);
      let totalGain = 0;

      bands.forEach(band => {
        const bandFreq = band.frequency;
        const bandGain = band.gain;
        const bandQ = band.q;

        let gain = 0;
        const freqRatio = freq / bandFreq;

        switch (band.type) {
          case 'Bell':
            gain = bandGain / (1 + Math.pow((freq - bandFreq) / (bandFreq / bandQ), 2));
            break;
          case 'LowShelf':
            gain = bandGain / (1 + Math.pow(freqRatio, 2));
            break;
          case 'HighShelf':
            gain = bandGain / (1 + Math.pow(1 / freqRatio, 2));
            break;
          case 'Lowpass':
            gain = -bandGain * Math.pow(freqRatio, 2) / (1 + Math.pow(freqRatio, 2));
            break;
          case 'Highpass':
            gain = -bandGain / (1 + Math.pow(1 / freqRatio, 2));
            break;
          default:
            console.warn(`Unknown filter type: ${band.type}`);
        }

        totalGain += gain;
      });

      const y = (1 - (totalGain + 12) / 24) * height;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  return (
    <div className="eq-container">
      <div className="graph-area">
        <canvas ref={canvasRef} width="800" height="300" />
        {bands.map(band => (
          <div
            key={band.id}
            className="band-control"
            style={{
              left: `${frequencyToPosition(band.frequency) * 100}%`,
              bottom: `${(band.gain + 12) / 24 * 100}%`,
              backgroundColor: band.color
            }}
            onMouseDown={(e) => handleDragStart(e, band.id)}
          />
        ))}
      </div>
      <div className="controls-area">
        {bands.map(band => (
          <div key={band.id} className="band-panel">
            <div className="label">Frequency</div>
            <input
              type="range"
              className="knob"
              min="20"
              max="20000"
              value={band.frequency}
              onChange={(e) => handleBandChange(band.id, 'frequency', e.target.value)}
            />
            <div className="value">{Math.round(band.frequency)} Hz</div>

            <div className="label">Gain</div>
            <input
              type="range"
              className="knob"
              min="-12"
              max="12"
              step="0.1"
              value={band.gain}
              onChange={(e) => handleBandChange(band.id, 'gain', e.target.value)}
            />
            <div className="value">{band.gain.toFixed(1)} dB</div>

            <div className="label">Q</div>
            <input
              type="range"
              className="knob"
              min="0.1"
              max="10"
              step="0.1"
              value={band.q}
              onChange={(e) => handleBandChange(band.id, 'q', e.target.value)}
            />
            <div className="value">{band.q.toFixed(1)}</div>

            <select
              className="filter-type-select"
              value={band.type}
              onChange={(e) => handleBandChange(band.id, 'type', e.target.value)}
            >
              {filterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;