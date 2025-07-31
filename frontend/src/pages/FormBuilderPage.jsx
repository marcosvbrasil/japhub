import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableField } from '../components/SortableField';
import { PropertiesPanel } from '../components/PropertiesPanel';

const availableFields = [
    { id: 'text', label: 'Texto Curto' },
    { id: 'textarea', label: 'Texto Longo' },
    { id: 'radio', label: 'Escolha Única' },
    { id: 'email', label: 'Email' },
    { id: 'date', label: 'Data' },
    { id: 'signature', label: 'Assinatura' },
];

const availableCategories = ['Logística', 'Comercial', 'Financeiro', 'RH', 'Operações'];

function FormBuilderPage({ onSaveForm }) {
    const [formFields, setFormFields] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const navigate = useNavigate();
    
    const selectedField = useMemo(() => 
        formFields.find(f => f.id === selectedFieldId), 
        [formFields, selectedFieldId]
    );

    const addField = (fieldType) => {
        const newField = {
            id: Date.now(), 
            type: fieldType.id,
            label: `Novo campo de ${fieldType.label}`,
            required: false,
            placeholder: '',
            ...(fieldType.id === 'radio' && { options: [{ id: Date.now(), label: 'Opção 1' }] })
        };
        setFormFields((fields) => [...fields, newField]);
    };

    const updateFieldProperty = (fieldId, property, value) => {
        setFormFields(prevFields => 
            prevFields.map(field => 
                field.id === fieldId ? { ...field, [property]: value } : field
            )
        );
    };
    
    const deleteField = (idToDelete) => {
        setFormFields(prevFields => prevFields.filter(field => field.id !== idToDelete));
        setSelectedFieldId(null);
    };
    
    const handlePublish = () => {
        if (!formTitle.trim()) {
            alert("Por favor, dê um título ao seu formulário.");
            return;
        }
        if (formFields.length === 0) {
            alert("Adicione pelo menos um campo antes de publicar!");
            return;
        }
        
        // CORREÇÃO: Garante que a categoria está no payload
        const newFormPayload = {
            name: formTitle,
            fields: formFields,
            categoria: formCategory,
        };
        
        // Chama a função "chefe" (addForm do App.jsx) para fazer o trabalho pesado
        onSaveForm(newFormPayload);
    };

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        setFormFields((items) => {
          const oldIndex = items.findIndex(item => item.id === active.id);
          const newIndex = items.findIndex(item => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    return (
        <div className="builder-page-container">
            <header className="builder-header">
                <div className="builder-header-left">
                    <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Formulário Sem Título"
                        className="form-title-input-header"
                    />
                    <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="category-select-header"
                    >
                        <option value="">Sem Categoria</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="builder-header-right">
                    <button className="publish-btn" onClick={handlePublish}>Publicar</button>
                </div>
            </header>

            <div className="builder-main-content">
                <aside className="builder-sidebar-left">
                    <h3>Campos</h3>
                    <ul>
                        {availableFields.map(field => (
                            <li key={field.id} className="field-type-item" onClick={() => addField(field)}>
                                {field.label}
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="builder-canvas-center">
                    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                        <div className="form-area">
                            {formFields.length === 0 ? (
                                <div className="canvas-empty-state">
                                    <h3>Comece a Construir o seu Formulário</h3>
                                    <p>Clique ou arraste os campos da esquerda para os adicionar aqui.</p>
                                </div>
                            ) : (
                                <SortableContext items={formFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                    {formFields.map(field => (
                                        <SortableField 
                                            key={field.id}
                                            field={field}
                                            onEdit={setSelectedFieldId}
                                        />
                                    ))}
                                </SortableContext>
                            )}
                        </div>
                    </DndContext>
                </main>

                <PropertiesPanel 
                    field={selectedField}
                    onUpdateProperty={updateFieldProperty}
                    onDelete={deleteField}
                    onClose={() => setSelectedFieldId(null)}
                />
            </div>
        </div>
    );
}

export default FormBuilderPage;