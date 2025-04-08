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
    Slider,
    FormControlLabel,
    Switch
} from '@mui/material';

const ResumeSalaryPredictor = () => {
    const [modelStructure, setModelStructure] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [formData, setFormData] = useState({
        total_experience: 0,
        count_additional_courses: 0,
        language_eng: 0,
        is_driver: 0,
        gender: null,
        area: null,
        skill: {},
        schedules: {},
        experience: {},
        employments: {},
        university: {}
    });
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [selectedExperience, setSelectedExperience] = useState([]);
    const [selectedEmployments, setSelectedEmployments] = useState([]);
    const [selectedUniversities, setSelectedUniversities] = useState([]);

    // Маппинг для отображения пола
    const genderDisplayMap = {
        male: 'Мужской',
        female: 'Женский'
    };

    // Маппинг для отображения уровня английского
    const englishLevelMap = {
        0: '0',
        1: 'A1',
        2: 'A2',
        3: 'B1',
        4: 'B2',
        5: 'C1',
        6: 'C2',
        7: 'Native'
    };

    useEffect(() => {
        const fetchModelStructure = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    'http://127.0.0.1:8000/prediction/model_structure/?base_model=resume'
                );
                setModelStructure(response.data.structure);

                // Устанавливаем значения по умолчанию
                const defaults = {
                    total_experience: response.data.structure.total_experience.default || 0,
                    count_additional_courses: response.data.structure.count_additional_courses.default || 0,
                    language_eng: response.data.structure.language_eng.default || 0,
                    is_driver: response.data.structure.is_driver.default || 0,
                    gender: response.data.structure.gender.default || null,
                    area: response.data.structure.area.default || null,
                    skill: {},
                    schedules: {},
                    experience: {},
                    employments: {},
                    university: {}
                };
                setFormData(defaults);
            } catch (error) {
                console.error('Error fetching model structure:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModelStructure();
    }, []);

    const handleNumberChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: parseFloat(e.target.value) || 0
        });
    };

    const handleSliderChange = (field) => (e, newValue) => {
        setFormData({
            ...formData,
            [field]: newValue
        });
    };

    const handleSwitchChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.checked ? 1 : 0
        });
    };

    const handleSelectChange = (field) => (e) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const handleMultiSelectChange = (field, setSelectedFn) => (event) => {
        const { value } = event.target;
        setSelectedFn(typeof value === 'string' ? value.split(',') : value);

        const itemsObj = {};
        value.forEach(item => {
            itemsObj[item] = true;
        });

        setFormData({
            ...formData,
            [field]: itemsObj
        });
    };

    const handlePredict = async () => {
        try {
            setLoading(true);

            // Формируем данные в точном соответствии с ожиданиями сервера
            const requestData = {
                total_experience: formData.total_experience,
                count_additional_courses: formData.count_additional_courses,
                language_eng: formData.language_eng,
                is_driver: formData.is_driver,
                ...(formData.gender && { gender: formData.gender }),
                ...(formData.area && { area: formData.area }),
                ...(Object.keys(formData.skill).length > 0 && { skill: formData.skill }),
                ...(Object.keys(formData.schedules).length > 0 && { schedules: formData.schedules }),
                ...(Object.keys(formData.experience).length > 0 && { experience: formData.experience }),
                ...(Object.keys(formData.employments).length > 0 && { employments: formData.employments }),
                ...(Object.keys(formData.university).length > 0 && { university: formData.university })
            };

            const response = await axios.post(
                'http://127.0.0.1:8000/prediction/resume_salary/',
                requestData
            );

            setPrediction(response.data.predicted_salary);
        } catch (error) {
            console.error('Prediction error:', error);
            alert(`Ошибка предсказания: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
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
        <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center">
                Калькулятор зарплаты для резюме
            </Typography>

            {/* Основные числовые параметры */}
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                {/* Общий опыт работы */}
                <TextField
                    fullWidth
                    label={modelStructure.total_experience.description}
                    type="number"
                    value={formData.total_experience}
                    onChange={handleNumberChange('total_experience')}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                />

                {/* Количество курсов */}
                <TextField
                    fullWidth
                    label={modelStructure.count_additional_courses.description}
                    type="number"
                    value={formData.count_additional_courses}
                    onChange={handleNumberChange('count_additional_courses')}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0 } }}
                />

                {/* Уровень английского */}
                <Box mt={2}>
                    <Typography gutterBottom>
                        {modelStructure.language_eng.description}
                    </Typography>
                    <Slider
                        value={formData.language_eng}
                        onChange={handleSliderChange('language_eng')}
                        min={0}
                        max={7}
                        step={1}
                        marks={[
                            { value: 0, label: '0' },
                            { value: 1, label: 'A1' },
                            { value: 2, label: 'A2' },
                            { value: 3, label: 'B1' },
                            { value: 4, label: 'B2' },
                            { value: 5, label: 'C1' },
                            { value: 6, label: 'C2' },
                            { value: 7, label: 'Native' }
                        ]}
                    />
                </Box>

                {/* Водительские права */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.is_driver === 1}
                            onChange={handleSwitchChange('is_driver')}
                            color="primary"
                        />
                    }
                    label={modelStructure.is_driver.description}
                    sx={{ mt: 2 }}
                />
            </Box>

            {/* Категориальные параметры */}
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mt={2}>
                {/* Пол */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.gender.description}</InputLabel>
                    <Select
                        value={formData.gender || ''}
                        onChange={handleSelectChange('gender')}
                        label={modelStructure.gender.description}
                    >
                        <MenuItem value={modelStructure.gender.default}>
                            {genderDisplayMap[modelStructure.gender.default] || modelStructure.gender.default}
                        </MenuItem>
                        {modelStructure.gender.options
                            .filter(opt => opt !== modelStructure.gender.default)
                            .map(option => (
                                <MenuItem key={option} value={option}>
                                    {genderDisplayMap[option] || option}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                {/* Город */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.area.description}</InputLabel>
                    <Select
                        value={formData.area || ''}
                        onChange={handleSelectChange('area')}
                        label={modelStructure.area.description}
                    >
                        <MenuItem value={modelStructure.area.default}>
                            {modelStructure.area.default}
                        </MenuItem>
                        {modelStructure.area.options
                            .filter(opt => opt !== modelStructure.area.default)
                            .map(option => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Мультиселекторы */}
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mt={2}>
                {/* Навыки */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.skill.description}</InputLabel>
                    <Select
                        multiple
                        value={selectedSkills}
                        onChange={handleMultiSelectChange('skill', setSelectedSkills)}
                        input={<OutlinedInput label={modelStructure.skill.description} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {modelStructure.skill.options.map((item) => (
                            <MenuItem key={item} value={item}>
                                <Checkbox checked={selectedSkills.includes(item)} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* График работы */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.schedules.description}</InputLabel>
                    <Select
                        multiple
                        value={selectedSchedules}
                        onChange={handleMultiSelectChange('schedules', setSelectedSchedules)}
                        input={<OutlinedInput label={modelStructure.schedules.description} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {modelStructure.schedules.options.map((item) => (
                            <MenuItem key={item} value={item}>
                                <Checkbox checked={selectedSchedules.includes(item)} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Опыт работы */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.experience.description}</InputLabel>
                    <Select
                        multiple
                        value={selectedExperience}
                        onChange={handleMultiSelectChange('experience', setSelectedExperience)}
                        input={<OutlinedInput label={modelStructure.experience.description} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {modelStructure.experience.options.map((item) => (
                            <MenuItem key={item} value={item}>
                                <Checkbox checked={selectedExperience.includes(item)} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Тип занятости */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.employments.description}</InputLabel>
                    <Select
                        multiple
                        value={selectedEmployments}
                        onChange={handleMultiSelectChange('employments', setSelectedEmployments)}
                        input={<OutlinedInput label={modelStructure.employments.description} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {modelStructure.employments.options.map((item) => (
                            <MenuItem key={item} value={item}>
                                <Checkbox checked={selectedEmployments.includes(item)} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Университеты */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>{modelStructure.university.description}</InputLabel>
                    <Select
                        multiple
                        value={selectedUniversities}
                        onChange={handleMultiSelectChange('university', setSelectedUniversities)}
                        input={<OutlinedInput label={modelStructure.university.description} />}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {modelStructure.university.options.map((item) => (
                            <MenuItem key={item} value={item}>
                                <Checkbox checked={selectedUniversities.includes(item)} />
                                <ListItemText primary={item} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box mt={3} display="flex" justifyContent="center">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePredict}
                    disabled={loading}
                    size="large"
                >
                    {loading ? <CircularProgress size={24} /> : 'Рассчитать зарплату'}
                </Button>
            </Box>

            {prediction !== null && (
                <Box mt={3} textAlign="center">
                    <Typography variant="h6">
                        Предсказанная зарплата: <strong>{prediction.toLocaleString()} ₽</strong>
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default ResumeSalaryPredictor;