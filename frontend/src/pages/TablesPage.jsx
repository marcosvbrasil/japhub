// frontend/src/pages/TablesPage.jsx

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

    // ... (useEffect para buscar e filtrar continua igual) ...
    useEffect(() => {
        const fetchResponses = async () => {
            const token = localStorage.getItem('japhub-token');
            if (!form || !token) { setLoading(false); return; }
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
        if (form) { fetchResponses(); }
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


    // --- MUDANÇAS NA PREPARAÇÃO DOS DADOS CSV/PDF ---
    const getCsvData = () => {
        if (!form) return { headers: [], data: [] };
        // Agora, para os cabeçalhos, usamos a propriedade 'label' de cada objeto de campo
        const headers = form.fields.map(field => ({ label: field.label, key: field.label }));
        const data = filteredResponses.map(response => response.data);
        return { headers, data };
    };
    const { headers: csvHeaders, data: csvData } = getCsvData();

    const handleExportPdf = () => {
        if (!form || filteredResponses.length === 0) { /* ... */ };
        const doc = new jsPDF();
        doc.text(`Respostas: ${form.name}`, 14, 20);
        doc.autoTable({
            startY: 30,
            // Aqui também usamos a propriedade 'label' para os cabeçalhos
            head: [form.fields.map(field => field.label)],
            // E aqui usamos o 'label' para buscar o dado correto de cada resposta
            body: filteredResponses.map(response => form.fields.map(field => response.data[field.label])),
        });
        const filename = `JAPHub_${form.name.replace(/ /g, "_")}_respostas.pdf`;
        doc.save(filename);
    };

    if (!form) { /* ... */ }
    if (loading) { /* ... */ }

    return (
        <div className="table-page-container">
            <h1>Respostas: {form.name}</h1>
            
            <div className="controls-container">
                {/* ... (controlos de busca e filtro continuam iguais, mas o select de coluna vai usar a nova estrutura) ... */}
                <select 
                    className="filter-select" 
                    value={filterColumn} 
                    onChange={(e) => {
                        setFilterColumn(e.target.value);
                        setFilterValue('');
                    }}
                >
                    <option value="">Filtrar por Coluna...</option>
                    {/* Aqui também usamos a propriedade 'label' */}
                    {form.fields.map(field => <option key={field.id} value={field.label}>{field.label}</option>)}
                </select>

                {/* ... (resto dos controlos) ... */}
            </div>
            
            <table className="data-table">
                <thead>
                    <tr>
                        {/* AQUI ESTÁ A CORREÇÃO PRINCIPAL: Usamos field.label para o nome da coluna */}
                        {form.fields.map(field => <th key={field.id}>{field.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {filteredResponses.length === 0 ? (
                        <tr>
                            <td colSpan={form.fields.length} style={{ textAlign: 'center' }}>
                                {/* ... */}
                            </td>
                        </tr>
                    ) : (
                        filteredResponses.map((response) => (
                            <tr key={response.id}>
                                {/* E AQUI TAMBÉM: Usamos field.label para encontrar o dado correto */}
                                {form.fields.map(field => (
                                    <td key={`${response.id}-${field.id}`}>{response.data[field.label]}</td>
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