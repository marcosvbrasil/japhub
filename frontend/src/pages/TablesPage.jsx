import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CSVLink } from "react-csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function TablesPage({ forms }) {
    const { formId } = useParams();
    const form = forms.find(f => f.id == formId);

    const [allResponses, setAllResponses] = useState([]);
    const [filteredResponses, setFilteredResponses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            const token = localStorage.getItem('japhub-token');
            if (!form || !token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/formularios/${form.id}/respostas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllResponses(response.data);
            } catch (error) {
                console.error("Erro ao buscar respostas:", error);
            } finally {
                setLoading(false);
            }
        };

        if (form) {
            fetchResponses();
        }
    }, [form]);

    useEffect(() => {
        let results = allResponses;
        if (searchTerm) {
            results = results.filter(response =>
                Object.values(response.data).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        if (filterColumn && filterValue) {
            results = results.filter(response => 
                String(response.data[filterColumn]) === String(filterValue)
            );
        }
        setFilteredResponses(results);
    }, [searchTerm, filterColumn, filterValue, allResponses]);

    const getUniqueFilterOptions = (column) => {
        if (!column || allResponses.length === 0) return [];
        const uniqueValues = [...new Set(allResponses.map(res => res.data[column]))];
        return uniqueValues.sort();
    };

    // Prepara os dados para a exportação CSV
    const getCsvData = () => {
        if (!form) return { headers: [], data: [] };
        const headers = form.fields.map(field => ({ label: field, key: field }));
        const data = filteredResponses.map(response => response.data);
        return { headers, data };
    };
    const { headers: csvHeaders, data: csvData } = getCsvData();

    // Função para gerar e descarregar o PDF
    const handleExportPdf = () => {
        if (!form || filteredResponses.length === 0) {
            alert("Não há dados para exportar.");
            return;
        };

        const doc = new jsPDF();
        
        doc.text(`Respostas: ${form.name}`, 14, 20);

        doc.autoTable({
            startY: 30,
            head: [form.fields],
            body: filteredResponses.map(response => form.fields.map(field => response.data[field])),
        });

        const filename = `JAPHub_${form.name.replace(/ /g, "_")}_respostas.pdf`;
        doc.save(filename);
    };


    if (!form) {
        return <div className="table-page-container"><h1>Formulário não encontrado!</h1></div>;
    }

    if (loading) {
        return <div className="table-page-container"><h1>A carregar respostas...</h1></div>;
    }

    return (
        <div className="table-page-container">
            <h1>Respostas: {form.name}</h1>
            
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Buscar em todas as colunas..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select 
                    className="filter-select" 
                    value={filterColumn} 
                    onChange={(e) => {
                        setFilterColumn(e.target.value);
                        setFilterValue('');
                    }}
                >
                    <option value="">Filtrar por Coluna...</option>
                    {form.fields.map(field => <option key={field} value={field}>{field}</option>)}
                </select>

                <select 
                    className="filter-select" 
                    value={filterValue} 
                    onChange={(e) => setFilterValue(e.target.value)}
                    disabled={!filterColumn}
                >
                    <option value="">Selecione um Valor...</option>
                    {getUniqueFilterOptions(filterColumn).map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                
                <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={`JAPHub_${form.name.replace(/ /g, "_")}_respostas.csv`}
                    className="export-button"
                    target="_blank"
                >
                    <FontAwesomeIcon icon={faFileCsv} />
                    <span>Exportar CSV</span>
                </CSVLink>

                <button onClick={handleExportPdf} className="export-button">
                    <FontAwesomeIcon icon={faFilePdf} />
                    <span>Exportar PDF</span>
                </button>
            </div>
            
            <table className="data-table">
                <thead>
                    <tr>
                        {form.fields.map(field => <th key={field}>{field}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {filteredResponses.length === 0 ? (
                        <tr>
                            <td colSpan={form.fields.length} style={{ textAlign: 'center' }}>
                                {searchTerm || filterValue ? "Nenhuma resposta encontrada para a sua busca/filtro." : "Ainda não há respostas para este formulário."}
                            </td>
                        </tr>
                    ) : (
                        filteredResponses.map((response) => (
                            <tr key={response.id}>
                                {form.fields.map(field => (
                                    <td key={`${response.id}-${field}`}>{response.data[field]}</td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TablesPage;