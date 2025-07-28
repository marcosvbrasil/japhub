import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';

// Componente auxiliar para renderizar o tipo de campo correto
const FieldRenderer = ({ field }) => {
  switch (field.type) {
    case 'textarea':
      return <textarea placeholder="Espaço para texto longo" className="field-input" disabled />;
    
    case 'radio':
      // Agora, em vez de um placeholder, renderizamos as opções de rádio reais
      return (
        <div className="radio-options-container">
          {(field.options || []).map(option => (
            <div key={option.id} className="radio-option-item">
              <input type="radio" id={`preview-${option.id}`} name={`preview-${field.id}`} disabled />
              <label htmlFor={`preview-${option.id}`}>{option.label}</label>
            </div>
          ))}
          {(!field.options || field.options.length === 0) && <p className="radio-no-options-text">Adicione opções no painel de propriedades</p>}
        </div>
      );

    case 'email':
    case 'date':
    case 'text':
    default:
      return <input type={field.type} placeholder={field.placeholder || `Insira o ${field.type} aqui`} className="field-input" disabled />;
  }
};

// Componente principal do campo arrastável
export function SortableField({ field, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} className="form-field-preview">
      <div {...attributes} {...listeners} className="drag-handle">⠿</div>
      <div className="field-content">
        <label>
            {field.label}
            {field.required && <span style={{ color: 'red' }}>*</span>}
        </label>
        
        <FieldRenderer field={field} />

      </div>
      <button className="edit-field-btn" onClick={() => onEdit(field.id)}>
        <FontAwesomeIcon icon={faCog} />
      </button>
    </div>
  );
}