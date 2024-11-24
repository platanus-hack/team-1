# platanus-hack-back

### Pasos para ejecutar el proyecto
```
# Crear un entorno virtual
python3 -m venv venv

# Activar el entorno virtual
source venv/bin/activate  # En macOS/Linux
venv\Scripts\activate  # En Windows

# Instalar dependencias dentro del entorno virtual
pip install -r requirements.txt

# Correr el proyecto
python3 run.py
```


---


### Estructura básica del proyecto


```
flask_project/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── main.py
├── run.py
├── requirements.txt
```

