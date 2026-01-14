# Tiago Delivery

Uma plataforma de delivery completa onde empresas podem cadastrar suas lojas e produtos, e clientes podem fazer compras online. A plataforma oferece gestão completa de múltiplas lojas por usuário, com catálogo de produtos individual para cada estabelecimento.

## Funcionalidades

### Para Empresas/Usuários

- **Gestão de Lojas**

  - Cadastro de múltiplas lojas por usuário
  - Edição completa de informações (nome, CNPJ, telefone, descrição)
  - Integração com ViaCEP para preenchimento automático de endereços brasileiros
  - Validação de dados de contato e documentos
  - Sistema de exclusão com confirmação

- **Gestão de Produtos**

  - Cadastro de produtos por loja
  - Edição de nome, descrição, preço e imagem
  - Controle de disponibilidade (ativar/desativar produtos)
  - Listagem visual com imagens e informações completas
  - Sistema de exclusão com confirmação

- **Perfil de Usuário**
  - Atualização de dados pessoais (nome, CPF, telefone)
  - Gerenciamento de múltiplos endereços
  - Dashboard com abas para lojas e dados pessoais
  - Visualização de todas as lojas cadastradas

### Sistema

- Sistema de autenticação seguro (Google OAuth)
- Validação de propriedade (usuário → loja → produto)
- Interface responsiva e moderna com Tailwind CSS
- API RESTful completa para todas as operações
- Máscaras automáticas para CPF, CNPJ, CEP e telefone

## Tecnologias Utilizadas

- **Frontend**: Next.js 16.1.1, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma 5.22.0
- **Autenticação**: NextAuth.js 4 (Google OAuth)
- **Componentes**: IMaskInput para máscaras de entrada
- **APIs Externas**: ViaCEP para busca de endereços brasileiros
- **Deploy**: Vercel (recomendado)

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta Google para OAuth

## Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/delivery.git
   cd delivery
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias:
     ```env
     DATABASE_URL=postgresql://usuario:senha@localhost:5432/tiago_delivery
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=seu-secret-aleatorio-aqui
     GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=seu-client-secret
     ```

4. **Configure o banco de dados**

   - Execute as migrações:
     ```bash
     npx prisma migrate deploy
     ```
   - Gere o cliente Prisma:
     ```bash
     npx prisma generate
     ```

5. **Configure o Google OAuth**
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um projeto e habilite a API do Google+
   - Configure as credenciais OAuth 2.0
   - Adicione `http://localhost:3000/api/auth/callback/google` às URIs autorizadas

## Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth.js
│   │   ├── addresses/     # API de endereços
│   │   ├── countries/     # API de países
│   │   ├── onboarding/    # API de onboarding
│   │   ├── profile/       # API de perfil
│   │   ├── stores/        # API de lojas
│   │   │   └── [id]/      # Operações por loja (PUT, DELETE)
│   │   └── products/      # API de produtos
│   │       └── [id]/      # Operações por produto (PUT, DELETE)
│   ├── onboarding/        # Página de onboarding
│   ├── profile/           # Página de perfil com abas
│   ├── store/             # Página de cadastro/edição de lojas
│   ├── products/          # Gestão de produtos
│   │   ├── page.js        # Listagem de produtos
│   │   ├── new/           # Novo produto
│   │   └── edit/          # Editar produto
│   ├── globals.css        # Estilos globais
│   ├── layout.js          # Layout principal
│   └── page.js            # Página inicial
├── components/            # Componentes reutilizáveis
│   └── StoreForm.js       # Formulário de loja com ViaCEP
├── lib/                   # Utilitários
│   ├── auth.js            # Configuração NextAuth
│   └── prisma.js          # Cliente Prisma
prisma/
├── schema.prisma          # Schema do banco
│                          # (User, Usuario, Store, Product)
└── migrations/            # Migrações
    ├── 20260113221049_add_store_fields
    ├── 20260113224538_allow_multiple_stores_per_user
    └── 20260113232743_add_products
public/
└── estados-cidades2.json  # Dados de estados brasileiros
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia o servidor de produção
- `npx prisma generate` - Gera o cliente Prisma
- `npx prisma migrate dev` - Cria e aplica migrações em desenvolvimento
- `npx prisma studio` - Abre interface visual do banco de dados

## Funcionalidades Implementadas

### Gestão de Lojas

- ✅ Cadastro de múltiplas lojas por usuário
- ✅ Edição completa de informações da loja
- ✅ Exclusão de lojas com validação de propriedade
- ✅ Integração com ViaCEP para busca automática de endereços
- ✅ Máscaras para CNPJ, telefone e CEP
- ✅ Conversão automática de códigos de estado para siglas (UF)

### Gestão de Produtos

- ✅ Listagem de produtos por loja
- ✅ Cadastro de novos produtos
- ✅ Edição de produtos existentes
- ✅ Exclusão de produtos com confirmação
- ✅ Controle de disponibilidade (ativar/desativar)
- ✅ Upload de imagens via URL
- ✅ Validação de preços e campos obrigatórios

### Perfil e Autenticação

- ✅ Login com Google OAuth
- ✅ Perfil com abas (Dados Pessoais, Endereços, Lojas)
- ✅ Atualização de dados pessoais
- ✅ Gerenciamento de múltiplos endereços
- ✅ Máscaras para CPF e telefone

## Modelo de Dados

### User (NextAuth)

- `id`: String (UUID)
- `name`: String
- `email`: String (único)
- `emailVerified`: DateTime
- `image`: String
- `stores`: Store[] (relação)

### Usuario (Dados Extras)

- `id`: String (UUID)
- `userId`: String (referência ao User)
- `name`: String
- `cpf`: String
- `phone`: String
- `addresses`: Json

### Store

- `id`: String (UUID)
- `userId`: String (referência ao User)
- `name`: String
- `cnpj`: String
- `phone`: String
- `description`: String
- `address`: Json (rua, número, complemento, bairro, cidade, estado, CEP)
- `products`: Product[] (relação)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Product

- `id`: String (UUID)
- `storeId`: String (referência à Store)
- `name`: String
- `description`: String
- `price`: Float
- `image`: String (URL)
- `available`: Boolean (default: true)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para dúvidas ou problemas, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.
