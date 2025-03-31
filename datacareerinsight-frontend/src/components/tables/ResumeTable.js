import GenericTable from './GenericTable';
import { resumeFieldsConfig } from '../configs/resume.config';

const ResumeTable = () => (
    <GenericTable
        title="Резюме"
        apiEndpoint="http://127.0.0.1:8000/resume/table/"
        fieldsConfig={resumeFieldsConfig}
        hiddenColumnsByDefault = {["id_resume", "created_at", "salary", "currency", "url"]}
    />
);

export default ResumeTable;