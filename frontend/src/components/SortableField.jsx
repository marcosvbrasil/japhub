import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente auxiliar para renderizar a pré-visualização do tipo de campo correto
const FieldRenderer = ({ field }) => {
  switch (field.type) {
    case 'textarea':
      return <textarea placeholder={field.placeholder || "Espaço para texto longo"} className="field-input" disabled />;
    
    // Unificamos a lógica para radio e checkbox na pré-visualização
    case 'radio':
    case 'checkbox':
      return (
        <div className="radio-options-container">
          {(field.options || []).map((option) => (
            <div key={option.id} className="radio-option-item">
              <input 
                type={field.type} 
                id={`preview-${option.id}`} 
                name={`preview-${field.id}`} 
                // A linha 'checked' foi removida para que apareçam desmarcados
                disabled 
                readOnly
              />
              <label htmlFor={`preview-${option.id}`}>{option.label}</label>
            </div>
          ))}
          {/* ... */}
        </div>
      );
    
    case 'signature':
      return (
          <div className="signature-pad" style={{ height: '100px', backgroundColor: '#f9f9f9' }}>
              <span className="signature-placeholder-line"></span>
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
export function SortableField({ field, onEdit, isSelected }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  // Constrói a string de classes dinamicamente para incluir 'selected' se for o caso
  const fieldClassName = `form-field-preview ${isSelected ? 'selected' : ''}`;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={fieldClassName}
      onClick={() => onEdit(field.id)} // O evento de clique está no container principal
    >
      <div {...attributes} {...listeners} className="drag-handle">⠿</div>
      <div className="field-content">
        <label>
            {field.label}
            {field.required && <span style={{ color: 'red' }}>*</span>}
        </label>
        
        <FieldRenderer field={field} />

      </div>
      {/* O botão de editar (engrenagem) foi removido para uma interface mais limpa */}
    </div>
  );
}