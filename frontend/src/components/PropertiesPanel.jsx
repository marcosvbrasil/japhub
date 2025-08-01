import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faPlus, faMousePointer } from '@fortawesome/free-solid-svg-icons';

// --- Sub-componente para editar as opções (sem alterações) ---
const RadioOptionsEditor = ({ field, onUpdateProperty }) => {
    
    const handleOptionChange = (optionId, newLabel) => {
        const newOptions = field.options.map(opt => 
            opt.id === optionId ? { ...opt, label: newLabel } : opt
        );
        onUpdateProperty(field.id, 'options', newOptions);
    };

    const addOption = () => {
        const newOption = { id: Date.now(), label: `Opção ${field.options.length + 1}` };
        const newOptions = [...field.options, newOption];
        onUpdateProperty(field.id, 'options', newOptions);
    };

    const deleteOption = (optionId) => {
        const newOptions = field.options.filter(opt => opt.id !== optionId);
        onUpdateProperty(field.id, 'options', newOptions);
    };

    return (
        <div className="property-item-options">
            {/* O label foi movido para o componente principal para consistência */ }
            {field.options.map((option) => (
                <div key={option.id} className="option-editor-item">
                    <input 
                        type="text" 
                        value={option.label}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder="Texto da opção"
                    />
                    <button onClick={() => deleteOption(option.id)} title="Apagar Opção">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            ))}
            <button onClick={addOption} className="add-option-btn">
                <FontAwesomeIcon icon={faPlus} />
                Adicionar Opção
            </button>
        </div>
    );
};

// --- Componente Principal do Painel de Propriedades (Reestruturado) ---
export function PropertiesPanel({ field, onUpdateProperty, onDelete, onClose }) {
  
  if (!field) {
      return (
        <aside className="properties-panel-right">
            <div className="panel-content-empty">
                <FontAwesomeIcon icon={faMousePointer} style={{ fontSize: '32px', color: '#ccc', marginBottom: '16px' }}/>
                <h3>Nenhum Campo Selecionado</h3>
                <p>Clique num campo no painel central para editar as suas propriedades aqui.</p>
            </div>
        </aside>
      );
  }

  return (
    <aside className="properties-panel-right">
      <div className="panel-header">
        <h3>Propriedades do Campo</h3>
        <button onClick={onClose} className="close-panel-btn" title="Fechar Painel">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className="panel-content">
        {/* --- SECÇÃO "GERAL" --- */}
        <div className="panel-section">
          <h4 className="panel-section-title">Geral</h4>
          <div className="property-item">
            <label htmlFor="label-input">Texto da Pergunta</label>
            <input 
              id="label-input"
              type="text" 
              className="property-input"
              value={field.label}
              onChange={(e) => onUpdateProperty(field.id, 'label', e.target.value)}
            />
          </div>
          <div className="property-item-toggle">
            <label htmlFor="required-toggle">Obrigatório</label>
            <label className="switch">
              <input 
                  id="required-toggle"
                  type="checkbox" 
                  checked={field.required}
                  onChange={(e) => onUpdateProperty(field.id, 'required', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* --- SECÇÃO "APARÊNCIA" --- */}
        {['text', 'textarea', 'email'].includes(field.type) && (
            <div className="panel-section">
                <h4 className="panel-section-title">Aparência</h4>
                <div className="property-item">
                    <label htmlFor="placeholder-input">Texto de Exemplo (Placeholder)</label>
                    <input 
                        id="placeholder-input"
                        type="text" 
                        className="property-input"
                        value={field.placeholder || ''}
                        onChange={(e) => onUpdateProperty(field.id, 'placeholder', e.target.value)}
                    />
                </div>
            </div>
        )}

        {/* --- SECÇÃO "OPÇÕES" --- */}
        {['radio', 'checkbox'].includes(field.type) && (
            <div className="panel-section">
                <h4 className="panel-section-title">Opções</h4>
                <RadioOptionsEditor field={field} onUpdateProperty={onUpdateProperty} />
            </div>
        )}
      </div>

      {/* --- ZONA DE PERIGO NO RODAPÉ --- */}
      <div className="panel-footer-destructive">
            <button className="delete-button-panel" onClick={() => onDelete(field.id)}>
                <FontAwesomeIcon icon={faTrash} />
                Apagar Campo
            </button>
      </div>
    </aside>
  );
}