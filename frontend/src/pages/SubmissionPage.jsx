import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SubmissionPage({ forms }) {
    const { formId } = useParams();
    const navigate = useNavigate();
    const form = forms.find(f => f.id == formId);

    const createInitialState = () => {
        if (!form) return {};
        const initialState = {};
        form.fields.forEach(field => {
            initialState[field.label] = '';
        });
        return initialState;
    };
    
    const [formData, setFormData] = useState(createInitialState);
    
    useEffect(() => {
        setFormData(createInitialState());
    }, [form]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const payload = { data: formData };
            await axios.post(`http://localhost:8000/api/formularios/${formId}/respostas`, payload);
            alert('Resposta enviada com sucesso!');
            navigate(`/tabelas/${formId}`);
        } catch (error) {
            console.error("Erro ao submeter resposta:", error);
            alert("Não foi possível enviar a sua resposta. Tente novamente.");
        }
    };

    if (!form) {
        return (
            <div className="submission-page-container">
                <h1>Formulário não encontrado!</h1>
            </div>
        );
    }

    return (
        <div className="submission-page-container">
            <div className="form-submission-card">
                <header className="form-submission-header">
                    <h2>{form.name}</h2>
                    <p>Preencha os campos abaixo. Campos com * são obrigatórios.</p>
                </header>

                <form className="submission-form" onSubmit={handleSubmit}>
                    {form.fields.map(field => (
                        <div key={field.id} className="form-group">
                            <label>
                                {field.label} 
                                {field.required && <span style={{ color: 'red' }}>*</span>}
                            </label>

                            {/* --- Lógica de Renderização Condicional --- */}
                            {(() => {
                                switch (field.type) {
                                    case 'textarea':
                                        return (
                                            <textarea 
                                                id={field.id} 
                                                name={field.label}
                                                value={formData[field.label] || ''} 
                                                onChange={handleChange}
                                                required={field.required}
                                                className="field-input"
                                            />
                                        );
                                    case 'radio':
                                        return (
                                            <div className="radio-options-container-submission">
                                                {field.options.map(option => (
                                                    <div key={option.id} className="radio-option-item-submission">
                                                        <input 
                                                            type="radio" 
                                                            id={option.id} 
                                                            name={field.label}
                                                            value={option.label}
                                                            onChange={handleChange}
                                                            required={field.required}
                                                        />
                                                        <label htmlFor={option.id}>{option.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    default:
                                        return (
                                            <input 
                                                type={field.type}
                                                id={field.id} 
                                                name={field.label}
                                                value={formData[field.label] || ''} 
                                                onChange={handleChange}
                                                required={field.required}
                                            />
                                        );
                                }
                            })()}
                        </div>
                    ))}
                    <button type="submit" className="submit-btn">Submeter</button>
                </form>
            </div>
        </div>
    );
}

export default SubmissionPage;