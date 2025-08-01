import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Importe os seus componentes de campo
import SignatureField from '../components/SignatureField';

// Componente auxiliar para o input de ficheiro
const FileUploadField = ({ field, onChange }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        onChange({ target: { name: field.label, value: file } });
    };
    return <input type="file" id={field.id} name={field.label} onChange={handleFileChange} required={field.required} />;
};

function SubmissionPage({ forms }) {
    const { formId } = useParams();
    const navigate = useNavigate();
    const form = forms.find(f => f.id == formId);

    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estados para o formulário de etapas
    const [currentStep, setCurrentStep] = useState(0);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (form) {
            const initialState = {};
            form.fields.forEach(field => {
                initialState[field.label] = '';
            });
            setFormData(initialState);
        }
    }, [form]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

     const handleCheckboxChange = (fieldName, optionLabel) => {
        // Pega no array de respostas atual para este campo, ou cria um novo se não existir
        const currentAnswers = formData[fieldName] || [];
        let newAnswers;

        if (currentAnswers.includes(optionLabel)) {
            // Se a opção já estiver selecionada, remove-a (desmarcar)
            newAnswers = currentAnswers.filter(answer => answer !== optionLabel);
        } else {
            // Se a opção não estiver selecionada, adiciona-a (marcar)
            newAnswers = [...currentAnswers, optionLabel];
        }

        // Atualiza o estado com o novo array de respostas
        setFormData(prevState => ({ ...prevState, [fieldName]: newAnswers }));
    };
    
    // Funções de navegação para o formulário de etapas
    const handleNext = () => {
        const currentField = form.fields[currentStep];
        if (currentField.required && !formData[currentField.label]) {
            setFormErrors({ ...formErrors, [currentField.label]: 'Este campo é obrigatório.' });
            return;
        }
        
        if (currentStep < form.fields.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();

        const lastField = form.fields[currentStep];
        if (lastField.required && !formData[lastField.label]) {
            setFormErrors({ ...formErrors, [lastField.label]: 'Este campo é obrigatório.' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const token = localStorage.getItem('japhub-token');
            const dataPayload = { ...formData }; 

            for (const field of form.fields) {
                if (field.type === 'file' && dataPayload[field.label] instanceof File) {
                    const file = dataPayload[field.label];
                    
                    const signedUrlResponse = await axios.post('http://localhost:8000/api/uploads/assinar-url', 
                        { fileName: file.name, fileType: file.type },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const { signedUrl, path } = signedUrlResponse.data;

                    await axios.put(signedUrl, file, {
                        headers: { 'Content-Type': file.type }
                    });

                    const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upload-formularios/${path}`;
                    dataPayload[field.label] = publicUrl;
                }
            }

            // CORREÇÃO: Adicionamos o cabeçalho de autorização aqui
            await axios.post(
                `http://localhost:8000/api/formularios/${formId}/respostas`, 
                { data: dataPayload },
                { headers: { Authorization: `Bearer ${token}` } } 
            );

            alert('Resposta enviada com sucesso!');
            // Redireciona para o portal ou para o histórico após a submissão
            navigate('/portal/minhas-submissoes');

        } catch (error) {
            console.error("Erro ao submeter resposta:", error);
            alert("Não foi possível enviar a sua resposta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!form) {
        return <div className="submission-page-container"><h1>Formulário não encontrado!</h1></div>;
    }

    const progress = ((currentStep + 1) / form.fields.length) * 100;
    const currentField = form.fields[currentStep];
    const isLastStep = currentStep === form.fields.length - 1;

    return (
        <div className="submission-page-container card-form-mode">
            <div className="form-submission-card card-step-card">
                <header className="form-submission-header">
                    <h2>{form.name}</h2>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                </header>

                <div className="submission-form-step">
                    <div key={currentField.id} className="form-group animate-step">
                        <label htmlFor={currentField.id}>
                            {currentField.label} 
                            {currentField.required && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        
                        {(() => {
                            switch (currentField.type) {
                                case 'file': return <FileUploadField field={currentField} onChange={handleChange} />;
                                case 'textarea': return <textarea id={currentField.id} name={currentField.label} value={formData[currentField.label] || ''} onChange={handleChange} required={currentField.required} />;
                                case 'signature': return <SignatureField field={currentField} onChange={handleChange} />;
                                case 'radio': return (
                                    <div className="radio-options-container"> 
                                        {currentField.options.map(option => (
                                            <div key={option.id} className="radio-option-item">
                                                <input type="radio" id={option.id} name={currentField.label} value={option.label} checked={formData[currentField.label] === option.label} onChange={handleChange} required={currentField.required} />
                                                <label htmlFor={option.id}>{option.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                );

                                case 'checkbox':
                                    return (
                                        <div className="radio-options-container">
                                            {currentField.options.map(option => (
                                                <div key={option.id} className="radio-option-item">
                                                    <input 
                                                        type="checkbox" 
                                                        id={option.id} 
                                                        name={currentField.label} 
                                                        value={option.label}
                                                        // Verifica se a opção está no nosso array de respostas
                                                        checked={(formData[currentField.label] || []).includes(option.label)}
                                                        onChange={() => handleCheckboxChange(currentField.label, option.label)}
                                                    />
                                                    <label htmlFor={option.id}>{option.label}</label>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                    
                                default: return <input type={currentField.type} id={currentField.id} name={currentField.label} value={formData[currentField.label] || ''} onChange={handleChange} required={currentField.required} />;
                            }
                        })()}
                        {formErrors[currentField.label] && <p className="error-message">{formErrors[currentField.label]}</p>}
                    </div>
                </div>

                <footer className="step-navigation">
                    {currentStep > 0 && (
                        <button type="button" className="nav-button prev-button" onClick={handlePrev}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Anterior
                        </button>
                    )}
                    
                    {!isLastStep && (
                        <button type="button" className="nav-button next-button" onClick={handleNext}>
                            Próximo
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    )}
                    
                    {isLastStep && (
                        <button onClick={handleSubmit} className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'A Enviar...' : 'Submeter'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}

export default SubmissionPage;