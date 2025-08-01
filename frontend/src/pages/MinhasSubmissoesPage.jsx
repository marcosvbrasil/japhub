import { useState, useEffect } from 'react';
import axios from 'axios';

function MinhasSubmissoesPage() {
    const [submissoes, setSubmissoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissoes = async () => {
            try {
                const token = localStorage.getItem('japhub-token');
                const response = await axios.get('http://localhost:8000/api/respostas/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubmissoes(response.data);
            } catch (error) {
                console.error("Erro ao buscar submissões:", error);
                alert("Não foi possível carregar o seu histórico.");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissoes();
    }, []);

    if (loading) {
        return (
            <div className="page-header">
                <h1>A Carregar Histórico...</h1>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>Minhas Submissões</h1>
                    <p>Aqui está um registo de todos os formulários que você já preencheu.</p>
                </div>
            </div>

            {submissoes.length === 0 ? (
                <div className="canvas-empty-state">
                    <h3>Nenhuma submissão encontrada</h3>
                    <p>Você ainda não preencheu nenhum formulário.</p>
                </div>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Formulário</th>
                            <th>Data de Submissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissoes.map(sub => (
                            <tr key={sub.id}>
                                <td>{sub.form_name}</td>
                                <td>{new Date(sub.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
}

export default MinhasSubmissoesPage;