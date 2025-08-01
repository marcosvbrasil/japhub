import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import './SignatureField.css';

const SignatureField = ({ field, onChange }) => {
  const sigCanvas = useRef({});

  const clear = () => {
    sigCanvas.current.clear();
    onChange({ target: { name: field.label, value: '' } });
  };

  const handleEnd = () => {
    const signatureData = sigCanvas.current.toDataURL();
    onChange({ target: { name: field.label, value: signatureData } });
  };

  return (
    <div className="signature-field-wrapper">
      <SignatureCanvas
        ref={sigCanvas}
        penColor='black'
        canvasProps={{ className: 'signature-canvas' }}
        onEnd={handleEnd}
      />
      <button type="button" onClick={clear} className="clear-signature-btn">
        Limpar
      </button>
    </div>
  );
};

export default SignatureField;