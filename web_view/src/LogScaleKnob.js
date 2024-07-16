import React, { useState, useCallback, useEffect } from 'react';

const LogScaleKnob = ({ min, max, defaultValue, onChange }) => {
  const [logValue, setLogValue] = useState(Math.log(defaultValue));

  const logToLinear = useCallback((value) => {
    return Math.exp(value);
  }, []);

  const linearToLog = useCallback((value) => {
    return Math.log(value);
  }, []);

  const sliderToLog = useCallback((sliderValue) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    return minLog + (maxLog - minLog) * sliderValue;
  }, [min, max]);

  const logToSlider = useCallback((logValue) => {
    const minLog = Math.log(min);
    const maxLog = Math.log(max);
    return (logValue - minLog) / (maxLog - minLog);
  }, [min, max]);

  const handleChange = (event) => {
    const sliderValue = Number(event.target.value);
    const newLogValue = sliderToLog(sliderValue);
    setLogValue(newLogValue);
    const linearValue = logToLinear(newLogValue);
    if (onChange) {
      onChange(linearValue);
    }
  };

  useEffect(() => {
    setLogValue(linearToLog(defaultValue));
  }, [defaultValue, linearToLog]);

  return (
    <div>
      <input
        type="range"
        className="knob"
        min={0}
        max={1}
        step={0.001}
        value={logToSlider(logValue)}
        onChange={handleChange}
      />
    </div>
  );
};

export default LogScaleKnob;