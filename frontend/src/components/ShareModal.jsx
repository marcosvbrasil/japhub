import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

function ShareModal({ link, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // A API navigator.clipboard é segura e moderna para copiar para a área de transferência
    navigator.clipboard.writeText(link);
    setCopied(true);
    // Mostra a mensagem "Copiado!" por 2 segundos
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn"><FontAwesomeIcon icon={faTimes} /></button>
        <h2>Partilhar Formulário</h2>
        <p>Qualquer pessoa com este link poderá aceder e preencher o formulário.</p>
        <div className="share-link-container">
          <input type="text" value={link} readOnly />
          <button onClick={handleCopy} className={copied ? 'copied' : ''}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;