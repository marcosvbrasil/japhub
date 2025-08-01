import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { SortableField } from '../components/SortableField';
import { PropertiesPanel } from '../components/PropertiesPanel';

const availableFields = [
    { id: 'text', label: 'Texto Curto' },
    { id: 'textarea', label: 'Texto Longo' },
    { id: 'radio', label: 'Escolha Única' },
    { id: 'checkbox', label: 'Múltipla Escolha' },
    { id: 'email', label: 'Email' },
    { id: 'date', label: 'Data' },
    { id: 'signature', label: 'Assinatura' },
];

const availableCategories = ['Logística', 'Comercial', 'Financeiro', 'RH', 'Operações'];

function FormBuilderPage() {
    const { formId } = useParams();
    const navigate = useNavigate();

    const [formFields, setFormFields] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (formId) {
            setIsLoading(true);
            const token = localStorage.getItem('japhub-token');
            axios.get(`http://localhost:8000/api/formularios/${formId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const form = response.data;
                setFormTitle(form.name);
                setFormCategory(form.categoria);
                setFormFields(form.fields);
            })
            .catch(error => {
                console.error("Erro ao buscar formulário para edição:", error);
                alert("Não foi possível carregar o formulário para edição.");
                navigate('/admin/dashboard');
            })
            .finally(() => setIsLoading(false));
        } else {
            const savedDraft = localStorage.getItem('formBuilderDraft');
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    setFormTitle(draft.title || '');
                    setFormCategory(draft.category || '');
                    setFormFields(draft.fields || []);
                } catch (error) {
                    console.error("Erro ao carregar o rascunho do formulário:", error);
                }
            }
        }
    }, [formId, navigate]);

    useEffect(() => {
        if (!formId) {
            const formDraft = {
                title: formTitle,
                category: formCategory,
                fields: formFields,
            };
            localStorage.setItem('formBuilderDraft', JSON.stringify(formDraft));
        }
    }, [formTitle, formCategory, formFields, formId]);

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
            ...(['radio', 'checkbox'].includes(fieldType.id) && { options: [{ id: Date.now(), label: 'Opção 1' }] })
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
        const fieldToDelete = formFields.find(f => f.id === idToDelete);
        const confirmation = window.confirm(
            `Tem a certeza de que quer apagar o campo "${fieldToDelete.label}"?`
        );

        if (confirmation) {
            setFormFields(prevFields => prevFields.filter(field => field.id !== idToDelete));
            setSelectedFieldId(null);
        }
    };
    
    const handlePublish = async () => {
        if (!formTitle.trim()) {
            alert("Por favor, dê um título ao seu formulário.");
            return;
        }
        
        const formPayload = {
            name: formTitle,
            fields: formFields,
            categoria: formCategory,
        };

        const token = localStorage.getItem('japhub-token');
        
        try {
            if (formId) {
                await axios.put(`http://localhost:8000/api/formularios/${formId}`, formPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Formulário atualizado com sucesso!');
            } else {
                await axios.post('http://localhost:8000/api/formularios', formPayload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Formulário criado com sucesso!');
                localStorage.removeItem('formBuilderDraft');
            }
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Erro ao salvar formulário:", error);
            alert("Não foi possível salvar o formulário.");
        }
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

    if (isLoading) {
        return (
            <div className="page-header">
                <h1>A carregar construtor...</h1>
            </div>
        );
    }

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
                    <button className="publish-btn" onClick={handlePublish}>
                        <FontAwesomeIcon icon={faCloudUploadAlt} style={{ marginRight: '8px' }} />
                        {formId ? 'Guardar Alterações' : 'Publicar'}
                    </button>
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
                                            isSelected={field.id === selectedFieldId}
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