# model_interpretation.py
import numpy as np
import pandas as pd
import statsmodels.api as sm
from typing import Dict, Any, Union
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.diagnostic import het_breuschpagan, normal_ad
from statsmodels.stats.stattools import durbin_watson


def get_model_results(model, X: pd.DataFrame, y: Union[pd.Series, np.ndarray], model_name: str = "salary_predictor") -> \
Dict[str, Any]:
    """
    Генерирует полный отчет о результатах регрессионной модели
    с гарантированной обработкой типов данных.
    """
    try:
        # 1. Подготовка данных
        y_values = y.values if isinstance(y, pd.Series) else y
        predictions = model.predict(X).values if hasattr(model.predict(X), 'values') else model.predict(X)

        # 2. Базовые расчеты
        residuals = y_values - predictions
        conf_int = model.conf_int()
        conf_int.columns = ['lower', 'upper']

        # 3. Основные метрики
        metrics = {
            'r_squared': {
                'value': float(model.rsquared),
                'interpretation': _interpret_rsquared(model.rsquared)
            },
            'adj_r_squared': {
                'value': float(model.rsquared_adj),
                'interpretation': _interpret_rsquared(model.rsquared_adj)
            },
            'rmse': {
                'value': float(np.sqrt(np.mean(np.square(residuals)))),
                'interpretation': _interpret_rmse(np.sqrt(np.mean(np.square(residuals))))
            }
        }

        # 4. Анализ остатков
        residual_tests = {
            'normality': _get_normality_test(residuals),
            'heteroskedasticity': _get_heteroskedasticity_test(residuals, X)
        }

        # 5. Анализ признаков
        feature_analysis = _analyze_features(model, conf_int)

        # 6. Собираем итоговый результат
        return {
            'prediction_summary': {
                'mean': float(np.mean(predictions)),
                'median': float(np.median(predictions)),
                'confidence_interval': {
                    'lower': float(np.mean(conf_int['lower'])),
                    'upper': float(np.mean(conf_int['upper']))
                }
            },
            'model_metrics': metrics,
            'residual_analysis': residual_tests,
            'feature_analysis': feature_analysis,
            'model_info': {
                'name': model_name,
                'features_count': int(X.shape[1]),
                'sample_size': int(X.shape[0]),
                'equation': _generate_equation(model)
            }
        }

    except Exception as e:
        return {
            "error": "Ошибка интерпретации модели",
            "details": str(e)
        }


def _get_normality_test(residuals: np.ndarray) -> Dict[str, Any]:
    """Вычисляет тест на нормальность остатков"""
    try:
        stat, p_value = normal_ad(residuals)
        return {
            'test': 'Anderson-Darling',
            'statistic': float(stat),
            'p_value': float(p_value),
            'interpretation': 'Нормальные' if p_value > 0.05 else 'Ненормальные'
        }
    except:
        return {
            'test': 'Anderson-Darling',
            'error': 'Не удалось вычислить'
        }


def _get_heteroskedasticity_test(residuals: np.ndarray, X: pd.DataFrame) -> Dict[str, Any]:
    """Вычисляет тест на гетероскедастичность"""
    try:
        _, p_value, _, _ = het_breuschpagan(residuals, X)
        return {
            'test': 'Breusch-Pagan',
            'p_value': float(p_value),
            'interpretation': 'Гомоскедастичность' if p_value > 0.05 else 'Гетероскедастичность'
        }
    except:
        return {
            'test': 'Breusch-Pagan',
            'error': 'Не удалось вычислить'
        }


def _analyze_features(model, conf_int: pd.DataFrame) -> Dict[str, Any]:
    """Анализирует важность признаков"""
    features = [f for f in model.params.index if f != 'const']
    feature_importance = []

    for feature in features:
        try:
            coef = float(model.params[feature])
            p_value = float(model.pvalues[feature])
            feature_importance.append({
                'feature': feature,
                'coefficient': coef,
                'p_value': p_value,
                'significant': p_value < 0.05,
                'conf_lower': float(conf_int.loc[feature, 'lower']),
                'conf_upper': float(conf_int.loc[feature, 'upper'])
            })
        except:
            continue

    # Топ влияющие факторы
    significant = [f for f in feature_importance if f['significant']]
    top_positive = sorted(significant, key=lambda x: x['coefficient'], reverse=True)[:3]
    top_negative = sorted(significant, key=lambda x: x['coefficient'])[:3]

    return {
        'all_features': feature_importance,
        'top_positive': top_positive,
        'top_negative': top_negative
    }


def _interpret_rsquared(rsquared: float) -> str:
    """Интерпретация R-квадрата"""
    if rsquared > 0.9:
        return "Отличное (>90%)"
    elif rsquared > 0.7:
        return "Хорошее (70-90%)"
    elif rsquared > 0.5:
        return "Умеренное (50-70%)"
    else:
        return "Слабое (<50%)"


def _interpret_rmse(rmse: float) -> str:
    """Интерпретация RMSE"""
    if rmse < 10000:
        return "Высокая точность"
    elif rmse < 20000:
        return "Средняя точность"
    else:
        return "Низкая точность"


def _generate_equation(model) -> str:
    """Генерирует уравнение модели"""
    equation = f"y = {float(model.params['const']):.2f}"
    for f in model.params.index:
        if f != 'const':
            equation += f" + {float(model.params[f]):.2f}*{f}"
    return equation