import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    OutlinedInput,
    Paper,
    CircularProgress,
    Grid
} from '@mui/material';
import SalaryPredictionResult from './SalaryPredictionResult';

const VacancySalaryPredictor = () => {
    const [modelStructure, setModelStructure] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [formData, setFormData] = useState({
        min_experience: 0,
        type_of_employment: null,
        work_format: null,
        skills: {},
        address: null
    });
    const [selectedSkills, setSelectedSkills] = useState([]);

    useEffect(() => {
        const fetchModelStructure = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    'http://127.0.0.1:8000/prediction/model_structure/?base_model=vacancies'
                );
                setModelStructure(response.data.structure);
                initializeFormData(response.data.structure);
            } catch (error) {
                console.error('Error fetching model structure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModelStructure();
    }, []);

    const initializeFormData = (structure) => {
        const defaults = {
            min_experience: structure.min_experience.default || 0,
            type_of_employment: structure.type_of_employment.default,
            work_format: structure.work_format.default,
            address: structure.address.default,
            skills: {}
        };
        setFormData(defaults);
    };

    const handleNumberChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: parseFloat(e.target.value) || 0
        });
    };

    const handleSelectChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const handleSkillsChange = (event) => {
        const { value } = event.target;
        setSelectedSkills(typeof value === 'string' ? value.split(',') : value);

        const skillsObj = {};
        value.forEach(skill => {
            skillsObj[skill] = true;
        });

        setFormData({
            ...formData,
            skills: skillsObj
        });
    };

    const handlePredict = async () => {
        try {
            setLoading(true);
            setPrediction(null);

            const requestData = {
                min_experience: formData.min_experience,
                ...(formData.type_of_employment && { type_of_employment: formData.type_of_employment }),
                ...(formData.work_format && { work_format: formData.work_format }),
                ...(Object.keys(formData.skills).length > 0 && { skills: formData.skills }),
                ...(formData.address && { address: formData.address })
            };

            const response = await axios.post(
                'http://127.0.0.1:8000/prediction/vacancies_salary/',
                requestData
            );

            setPrediction(response.data);
        } catch (error) {
            console.error('Prediction error:', error);
            alert(`Ошибка предсказания: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (modelStructure) {
            initializeFormData(modelStructure);
            setSelectedSkills([]);
            setPrediction(null);
        }
    };

    if (!modelStructure) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={10} sx={{
            p: 3,
            maxWidth: 800,
            margin: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 2
        }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: 'black' }}>
                Калькулятор зарплаты для вакансий
            </Typography>

            <TextField
                fullWidth
                label={modelStructure.min_experience.description}
                type="number"
                value={formData.min_experience}
                onChange={handleNumberChange('min_experience')}
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>{modelStructure.type_of_employment.description}</InputLabel>
                <Select
                    value={formData.type_of_employment || ''}
                    onChange={handleSelectChange('type_of_employment')}
                    label={modelStructure.type_of_employment.description}
                >
                    <MenuItem value={modelStructure.type_of_employment.default}>
                        {modelStructure.type_of_employment.default}
                    </MenuItem>
                    {modelStructure.type_of_employment.options
                        .filter(opt => opt !== modelStructure.type_of_employment.default)
                        .map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{modelStructure.work_format.description}</InputLabel>
                <Select
                    value={formData.work_format || ''}
                    onChange={handleSelectChange('work_format')}
                    label={modelStructure.work_format.description}
                >
                    <MenuItem value={modelStructure.work_format.default}>
                        {modelStructure.work_format.default}
                    </MenuItem>
                    {modelStructure.work_format.options
                        .filter(opt => opt !== modelStructure.work_format.default)
                        .map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{modelStructure.skills.description}</InputLabel>
                <Select
                    multiple
                    value={selectedSkills}
                    onChange={handleSkillsChange}
                    input={<OutlinedInput label={modelStructure.skills.description} />}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {modelStructure.skills.options.map((skill) => (
                        <MenuItem key={skill} value={skill}>
                            <Checkbox checked={selectedSkills.includes(skill)} />
                            <ListItemText primary={skill} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>{modelStructure.address.description}</InputLabel>
                <Select
                    value={formData.address || ''}
                    onChange={handleSelectChange('address')}
                    label={modelStructure.address.description}
                >
                    <MenuItem value={modelStructure.address.default}>
                        {modelStructure.address.default}
                    </MenuItem>
                    {modelStructure.address.options
                        .filter(opt => opt !== modelStructure.address.default)
                        .map(option => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <Grid container spacing={2} mt={3}>
                <Grid item xs={6}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleReset}
                        disabled={loading}
                        size="large"
                        sx={{
                            color: '#81c784',
                            borderColor: '#81c784',
                            '&:hover': {
                                borderColor: '#66bb6a',
                                backgroundColor: 'rgba(129, 199, 132, 0.08)'
                            }
                        }}
                    >
                        Очистить
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handlePredict}
                        disabled={loading}
                        size="large"
                        sx={{
                            backgroundColor: '#81c784',
                            '&:hover': {
                                backgroundColor: '#66bb6a'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Рассчитать зарплату'}
                    </Button>
                </Grid>
            </Grid>

            {prediction && <SalaryPredictionResult data={prediction} />}
        </Paper>
    );
};

export default VacancySalaryPredictor;