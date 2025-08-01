import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

function AnalisePage() {
    const { formId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formName, setFormName] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            const token = localStorage.getItem('japhub-token');
            try {
                const formRes = await axios.get(`http://localhost:8000/api/formularios/${formId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFormName(formRes.data.name);

                const reportRes = await axios.get(`http://localhost:8000/api/formularios/${formId}/analise`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReport(reportRes.data);
            } catch (error) {
                console.error("Erro ao buscar relatório:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [formId]);

    if (loading) {
        return <div className="page-header"><h1>A carregar relatório...</h1></div>;
    }

    if (!report) {
        return <div className="page-header"><h1>Não foi possível carregar o relatório.</h1></div>;
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1>Análise de Respostas</h1>
                    <p>Relatório para o formulário: <strong>{formName}</strong></p>
                </div>
                <Link to={`/tabelas/${formId}`} className="action-button">Ver Tabela de Dados</Link>
            </div>

            <div className="report-summary-card">
                <h2>Total de Respostas</h2>
                <span>{report.totalSubmissions}</span>
            </div>

            <div className="charts-container">
                {report.analysis.length === 0 && <p>Nenhuma resposta para analisar ainda.</p>}
                {report.analysis.map((item, index) => (
                    <div key={index} className="chart-card">
                        <h3>{item.fieldLabel}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={item.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {item.data.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </>
    );
}

export default AnalisePage;