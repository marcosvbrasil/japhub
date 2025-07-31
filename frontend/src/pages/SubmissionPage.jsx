import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Novo componente auxiliar para o input de ficheiro, para manter o código limpo
const FileUploadField = ({ field, onChange }) => {
    const handleFileChange = (event) => {
        // Pega no primeiro ficheiro selecionado pelo utilizador
        const file = event.target.files[0];
        // Passa o objeto do ficheiro inteiro para a nossa função 'handleChange'
        onChange({ target: { name: field.label, value: file } });
    };
    return <input type="file" id={field.id} name={field.label} onChange={handleFileChange} required={field.required} />;
};

function SubmissionPage({ forms }) {
    const { formId } = useParams();
    const navigate = useNavigate();
    const form = forms.find(f => f.id == formId);

    // Estado para guardar os dados do formulário (texto e ficheiros)
    const [formData, setFormData] = useState({});
    // Estado para controlar o loading do botão de submissão
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createInitialState = () => {
        if (!form) return {};
        const initialState = {};
        form.fields.forEach(field => {
            initialState[field.label] = '';
        });
        return initialState;
    };
    
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

    // A nossa função de submissão, agora muito mais poderosa
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('japhub-token');
            const dataPayload = { ...formData }; // Copia os dados do formulário

            // Itera sobre os campos do formulário para encontrar os que são do tipo 'file'
            for (const field of form.fields) {
                if (field.type === 'file' && dataPayload[field.label] instanceof File) {
                    const file = dataPayload[field.label];
                    
                    // 1. Pede o "bilhete dourado" (URL de upload) ao nosso backend
                    const signedUrlResponse = await axios.post('http://localhost:8000/api/uploads/assinar-url', 
                        { fileName: file.name, fileType: file.type },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const { signedUrl, path } = signedUrlResponse.data;

                    // 2. Faz o upload do ficheiro diretamente do navegador para o Supabase Storage
                    await axios.put(signedUrl, file, {
                        headers: { 'Content-Type': file.type }
                    });

                    // 3. Constrói o link público e permanente do ficheiro e substitui o objeto do ficheiro no nosso payload
                    const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/upload-formularios/${path}`;
                    dataPayload[field.label] = publicUrl;
                }
            }

            // 4. Submete a resposta final para a nossa API, agora com os links dos ficheiros em vez dos ficheiros em si
            await axios.post(`http://localhost:8000/api/formularios/${formId}/respostas`, { data: dataPayload });

            alert('Resposta enviada com sucesso!');
            navigate(`/tabelas/${formId}`);

        } catch (error) {
            console.error("Erro ao submeter resposta:", error);
            alert("Não foi possível enviar a sua resposta.");
        } finally {
            setIsSubmitting(false);
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
                            <label htmlFor={field.id}>
                                {field.label} 
                                {field.required && <span style={{ color: 'red' }}>*</span>}
                            </label>
                            
                            {(() => {
                                switch (field.type) {
                                    case 'file':
                                        return <FileUploadField field={field} onChange={handleChange} />;
                                    case 'textarea':
                                        return <textarea id={field.id} name={field.label} value={formData[field.label] || ''} onChange={handleChange} required={field.required} className="field-input" />;
                                    case 'radio':
                                        return (
                                            <div className="radio-options-container-submission">
                                                {field.options.map(option => (
                                                    <div key={option.id} className="radio-option-item-submission">
                                                        <input type="radio" id={option.id} name={field.label} value={option.label} onChange={handleChange} required={field.required} />
                                                        <label htmlFor={option.id}>{option.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    default:
                                        return <input type={field.type} id={field.id} name={field.label} value={formData[field.label] || ''} onChange={handleChange} required={field.required} />;
                                }
                            })()}
                        </div>
                    ))}
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'A Enviar...' : 'Submeter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SubmissionPage;