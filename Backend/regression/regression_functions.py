import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

from regression import constants, resume_regression, vacancies_regression




def predict_salary(model, base_model , **kwargs):
    if base_model=="vacancies":
        default_data = constants.default_vacancies_data.copy()
    else:
        default_data = constants.default_resume_data.copy()
    # Обновляем переданными значениями
    default_data.update(kwargs)

    predict_df = pd.DataFrame([default_data])
    return model.predict(predict_df)[0]
def calculate_vifs(X):
    vif_data = pd.DataFrame()
    # Исключаем 'const' из расчета VIF
    features = [col for col in X.columns if col != 'const']
    vif_data["feature"] = features
    vif_data["VIF"] = [variance_inflation_factor(X[features].values, i) for i in range(len(features))]
    return vif_data


def get_model(base_model):
    if base_model == "vacancies":
        df = vacancies_regression.prepare_df_for_vacancies_model()
        drop_columns = constants.vacancies_drop_columns.copy()
        y_column = constants.vacancies_y_column
    else:
        df = resume_regression.prepare_df_for_resume_model()
        drop_columns = constants.resume_drop_columns.copy()
        y_column = constants.resume_y_column

    X = df.drop(columns=drop_columns)
    y = df[y_column]
    X = sm.add_constant(X)

    all_significant = False

    while not all_significant:
        print(f"Fitting model with {X.shape[1]} features")
        model = sm.OLS(y, X).fit()

        if X.shape[1] == 52:
            print("Модель при 52 признаках:")
            print(model.summary())

        p_values = model.pvalues.drop('const', errors='ignore')

        if (p_values <= 0.05).all():
            all_significant = True
        else:
            max_p_value = p_values.max()
            if max_p_value > 0.05:
                feature_to_drop = p_values.idxmax()
                X = X.drop(columns=[feature_to_drop])
            else:
                all_significant = True

    high_vif = True
    while high_vif:
        vifs = calculate_vifs(X)
        max_vif = vifs['VIF'].max()
        if max_vif > 10:
            feature_to_drop = vifs.loc[vifs['VIF'].idxmax(), 'feature']
            X = X.drop(columns=[feature_to_drop])
        else:
            high_vif = False

    model = sm.OLS(y, X).fit()
    print(f"Финальная модель обучена с {X.shape[1]} признаками")
    return {"model": model,"X": X, "y": y}
