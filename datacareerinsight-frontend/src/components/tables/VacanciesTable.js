import GenericTable from './GenericTable';
import { vacanciesFieldsConfig } from '../configs/vacancies.config';

const VacanciesTable = () => (
    <GenericTable
        title="Вакансии"
        apiEndpoint="http://127.0.0.1:8000/vacancies/table/"
        fieldsConfig={vacanciesFieldsConfig}
        hiddenColumnsByDefault = {["id", "currency", "experience", "archived", "url", "salary_to", "salary_from"]}
    />
);

export default VacanciesTable;