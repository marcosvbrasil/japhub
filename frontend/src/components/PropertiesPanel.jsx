import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

// --- Sub-componente para editar as opções do campo de Escolha Única ---
// Foi criado aqui dentro para manter o código organizado, mas poderia ser um ficheiro separado.
const RadioOptionsEditor = ({ field, onUpdateProperty }) => {
    
    // Função para lidar com a mudança no texto de uma opção
    const handleOptionChange = (optionId, newLabel) => {
        // Cria um novo array de opções, atualizando apenas a que foi modificada
        const newOptions = field.options.map(opt => 
            opt.id === optionId ? { ...opt, label: newLabel } : opt
        );
        // Chama a função "chefe" para atualizar o estado no FormBuilderPage
        onUpdateProperty(field.id, 'options', newOptions);
    };

    // Função para adicionar uma nova opção à lista
    const addOption = () => {
        const newOption = { id: Date.now(), label: `Opção ${field.options.length + 1}` };
        // Cria um novo array com as opções antigas mais a nova
        const newOptions = [...field.options, newOption];
        onUpdateProperty(field.id, 'options', newOptions);
    };

    // Função para apagar uma opção da lista
    const deleteOption = (optionId) => {
        // Cria um novo array contendo apenas as opções cujo ID não corresponde ao que queremos apagar
        const newOptions = field.options.filter(opt => opt.id !== optionId);
        onUpdateProperty(field.id, 'options', newOptions);
    };

    return (
        <div className="property-item-options">
            <label>Opções de Escolha</label>
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


// --- Componente Principal do Painel de Propriedades ---
export function PropertiesPanel({ field, onUpdateProperty, onDelete, onClose }) {
  // Se nenhum campo estiver selecionado, não renderiza nada.
  if (!field) {
      return null;
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
        {/* Editor do Nome/Label do Campo */}
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

        {/* Interruptor de Campo Obrigatório */}
        <div className="property-item">
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
        
        <hr className="divider" />

        {/* Renderização condicional: mostra o editor de opções APENAS se o campo for do tipo 'radio' */}
        {field.type === 'radio' && (
            <RadioOptionsEditor field={field} onUpdateProperty={onUpdateProperty} />
        )}

      </div>

      <div className="panel-footer">
            <button className="delete-button-panel" onClick={() => onDelete(field.id)}>
                <FontAwesomeIcon icon={faTrash} />
                Apagar Campo
            </button>
      </div>
    </aside>
  );
}