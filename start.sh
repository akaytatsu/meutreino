#!/bin/bash

# Script para iniciar o Relógio de Academia
echo "🏋️ Iniciando Relógio de Academia - Meu Treino"
echo "=============================================="

# Verificar se está no diretório correto
if [ ! -f "index.html" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto"
    exit 1
fi

echo "📁 Diretório: $(pwd)"
echo "📋 Arquivos encontrados:"
ls -la *.html *.css *.js *.md 2>/dev/null || echo "   Alguns arquivos podem estar faltando"

echo ""
echo "🚀 Opções de execução:"
echo "1. Abrir no navegador padrão"
echo "2. Iniciar servidor local (Python)"
echo "3. Iniciar servidor local (Node.js)"
echo "4. Abrir página de teste"
echo "5. Sair"

read -p "Escolha uma opção (1-5): " opcao

case $opcao in
    1)
        echo "🌐 Abrindo no navegador..."
        if command -v xdg-open > /dev/null; then
            xdg-open index.html
        elif command -v open > /dev/null; then
            open index.html
        else
            echo "❌ Não foi possível abrir automaticamente. Abra manualmente: file://$(pwd)/index.html"
        fi
        ;;
    2)
        echo "🐍 Iniciando servidor Python..."
        if command -v python3 > /dev/null; then
            echo "📡 Servidor rodando em: http://localhost:8000"
            echo "🎯 Acesse: http://localhost:8000/index.html"
            echo "🧪 Teste: http://localhost:8000/teste.html"
            echo "Press Ctrl+C to stop"
            python3 -m http.server 8000
        elif command -v python > /dev/null; then
            echo "📡 Servidor rodando em: http://localhost:8000"
            echo "🎯 Acesse: http://localhost:8000/index.html"
            echo "🧪 Teste: http://localhost:8000/teste.html"
            echo "Press Ctrl+C to stop"
            python -m SimpleHTTPServer 8000
        else
            echo "❌ Python não encontrado"
        fi
        ;;
    3)
        echo "📦 Iniciando servidor Node.js..."
        if command -v npx > /dev/null; then
            echo "📡 Servidor rodando em: http://localhost:3000"
            echo "🎯 Acesse: http://localhost:3000/index.html"
            echo "🧪 Teste: http://localhost:3000/teste.html"
            echo "Press Ctrl+C to stop"
            npx http-server -p 3000
        else
            echo "❌ Node.js/npx não encontrado"
            echo "💡 Instale com: npm install -g http-server"
        fi
        ;;
    4)
        echo "🧪 Abrindo página de teste..."
        if command -v xdg-open > /dev/null; then
            xdg-open teste.html
        elif command -v open > /dev/null; then
            open teste.html
        else
            echo "❌ Não foi possível abrir automaticamente. Abra manualmente: file://$(pwd)/teste.html"
        fi
        ;;
    5)
        echo "👋 Saindo..."
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
