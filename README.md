# 🎙️ Essência em Diálogo

> **Duas perspectivas. Um tema. Uma conversa além da superfície.**

Repositório oficial do website e CMS editorial do **Essência em Diálogo**, apresentado por **Erick Torritezi e Iolanda Reis**.

---

## 📌 Sobre o projeto

**Essência em Diálogo** é um programa de conversas profundas sobre temas que atravessam a experiência humana.

Em cada episódio, diferentes perspectivas se encontram para explorar questões relacionadas a:

- emoções;
- relacionamentos;
- comportamento;
- escolhas;
- padrões;
- autoconhecimento;
- propósito;
- desenvolvimento humano;
- conflitos internos;
- existência.

O website não será apenas uma página institucional do podcast.

O projeto está sendo concebido como uma **plataforma editorial própria**, capaz de reunir episódios, artigos, notícias, eventos, conteúdos especiais e diferentes formas de interação com o público.

---

## 🚧 Status do projeto

> **FASE ATUAL: ARQUITETURA E PRÉ-DESENVOLVIMENTO**

O projeto ainda **não está em produção**.

Neste momento estão sendo definidos e validados:

- arquitetura de software;
- arquitetura PostgreSQL;
- infraestrutura Railway;
- autenticação;
- RBAC;
- CMS;
- segurança;
- auditoria;
- armazenamento de mídia;
- integrações;
- CI/CD;
- estratégia de testes;
- QA;
- deploy;
- backup e disaster recovery.

O desenvolvimento somente deverá começar após a aprovação formal do plano técnico.

---

## 🎯 Objetivo

Construir uma plataforma:

- editorial;
- responsiva;
- mobile first;
- segura;
- administrável;
- auditável;
- acessível;
- performática;
- escalável;
- documentada;
- preparada para produção.

A tecnologia deverá permanecer simples para o visitante e previsível para quem administra o projeto.

---

## 🧩 Escopo principal

A plataforma deverá contemplar:

### Website público

- Home;
- O Programa;
- Episódios;
- Artigos;
- Notícias;
- Eventos;
- Apresentadores;
- Ouça Agora;
- Contato;
- Busca;
- páginas legais.

### Conteúdo audiovisual

- catálogo de episódios;
- páginas individuais;
- capas;
- metadados;
- Spotify;
- outras plataformas;
- player incorporado quando suportado;
- links externos;
- transcrições opcionais.

### CMS

Painel administrativo próprio em:

`/admin`

Com gerenciamento de:

- páginas;
- seções;
- episódios;
- artigos;
- notícias;
- eventos;
- mídia;
- menus;
- plataformas;
- usuários;
- colaboradores;
- configurações;
- SEO;
- rádio/ON AIR;
- logs de auditoria.

---

## 👥 Perfis de acesso

### Administrador

Possui controle global da plataforma.

Entre suas atribuições estarão:

- gerenciamento de conteúdo;
- gerenciamento estrutural;
- usuários;
- colaboradores;
- configurações;
- mídia;
- menus;
- episódios;
- publicações;
- SEO;
- rádio;
- auditoria.

### Colaborador

Terá acesso editorial restrito a:

- artigos;
- notícias;
- eventos;
- próprio perfil.

As permissões deverão ser garantidas no backend, e não apenas escondidas visualmente na interface.

---

## 📝 Fluxo editorial

Estados inicialmente previstos:

```text
Rascunho
   ↓
Em revisão
   ↓
Agendado
   ↓
Publicado
   ↓
Pausado / Arquivado

