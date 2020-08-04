'use strict'

import chai from 'chai'
import chaiSubset from 'chai-subset'
import nock from 'nock'
import path from 'path'

import cep from '../../src/cep-promise.js'
import CepPromiseError from '../../src/errors/cep-promise.js'

chai.use(chaiSubset)

let expect = chai.expect

describe('when invoked with providers parameter', () => {
  describe('and the providers param is a string', () => {
    it('should reject with "validation_error"', () => {
      return cep('05010000', 'viacep').catch(error => {
        return expect(error)
          .to.be.an.instanceOf(CepPromiseError)
          .and.containSubset({
            name: 'CepPromiseError',
            message: 'Erro ao inicializar a instância do CepPromise.',
            type: 'validation_error',
            errors: [
              {
                service: 'cep_validation',
                message: 'O parâmetro providers deve ser uma lista.'
              }
            ]
          })
      })
    })
  })

  describe('and the providers param is a integer', () => {
    it('should reject with "validation_error"', () => {
      return cep('05010000', 123).catch(error => {
        return expect(error)
          .to.be.an.instanceOf(CepPromiseError)
          .and.containSubset({
            name: 'CepPromiseError',
            message: 'Erro ao inicializar a instância do CepPromise.',
            type: 'validation_error',
            errors: [
              {
                service: 'cep_validation',
                message: 'O parâmetro providers deve ser uma lista.'
              }
            ]
          })
      })
    })
  })

  describe('and the providers param is a object', () => {
    it('should reject with "validation_error"', () => {
      return cep('05010000', {}).catch(error => {
        return expect(error)
          .to.be.an.instanceOf(CepPromiseError)
          .and.containSubset({
            name: 'CepPromiseError',
            message: 'Erro ao inicializar a instância do CepPromise.',
            type: 'validation_error',
            errors: [
              {
                service: 'cep_validation',
                message: 'O parâmetro providers deve ser uma lista.'
              }
            ]
          })
      })
    })
  })

  describe('and the providers param is a function', () => {
    it('should reject with "validation_error"', () => {
      return cep('05010000', () => () => {}).catch(error => {
        return expect(error)
          .to.be.an.instanceOf(CepPromiseError)
          .and.containSubset({
            name: 'CepPromiseError',
            message: 'Erro ao inicializar a instância do CepPromise.',
            type: 'validation_error',
            errors: [
              {
                service: 'cep_validation',
                message: 'O parâmetro providers deve ser uma lista.'
              }
            ]
          })
      })
    })
  })

  describe('and the providers param is a invalid array', () => {
    it('should reject with "validation_error"', () => {
      return cep('05010000', [ 123, 'viacep']).catch(error => {
        return expect(error)
          .to.be.an.instanceOf(CepPromiseError)
          .and.containSubset({
            message: 'Erro ao inicializar a instância do CepPromise.',
            type: 'validation_error',
            errors: [
              {
                message:
                  'O provider "123" é inválido. Os providers disponíveis são: correios, viacep, widenet.',
                service: 'cep_validation'
              }
            ]
          })
      })
    })
  })

  describe('and the providers param is [\'viacep\']', () => {
    it('should call only viacep service', () => {
      const correiosMock = nock('https://apps.correios.com.br')
        .post('/SigepMasterJPA/AtendeClienteService/AtendeCliente')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/response-cep-05010000-found.xml')
        )

      const viaCepMock = nock('https://viacep.com.br')
        .get('/ws/05010000/json/')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/viacep-cep-05010000-found.json')
        )

      const wideNetMock = nock('https://cep.widenet.host')
        .get('/busca-cep/api/cep/05010000.json')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/widenet-cep-05010000-found.json')
        )

      return cep('05010000', ['viacep'])
        .then(address => {
          expect(address).to.deep.equal({
            cep: '05010000',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Perdizes',
            street: 'Rua Caiubi'
          })

          expect(viaCepMock.isDone()).to.be.equal(true)
          expect(correiosMock.isDone()).to.be.equal(false)
          expect(wideNetMock.isDone()).to.be.equal(false)
      })
    })
  })

  describe('and the providers param is [\'widenet\']', () => {
    it('should call only widenet service', () => {
      const correiosMock = nock('https://apps.correios.com.br')
        .post('/SigepMasterJPA/AtendeClienteService/AtendeCliente')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/response-cep-05010000-found.xml')
        )

      const viaCepMock = nock('https://viacep.com.br')
        .get('/ws/05010000/json/')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/viacep-cep-05010000-found.json')
        )

      const wideNetMock = nock('https://cep.widenet.host')
        .get('/busca-cep/api/cep/05010000.json')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/widenet-cep-05010000-found.json')
        )

      return cep('05010000', ['widenet'])
        .then(address => {
          expect(address).to.deep.equal({
            cep: '05010000',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Perdizes',
            street: 'Rua Caiubi'
          })

          expect(wideNetMock.isDone()).to.be.equal(true)
          expect(viaCepMock.isDone()).to.be.equal(false)
          expect(correiosMock.isDone()).to.be.equal(false)
      })
    })
  })

  describe('and the providers param is [\'correios\']', () => {
    it('should call only correios service', () => {
      const correiosMock = nock('https://apps.correios.com.br')
        .post('/SigepMasterJPA/AtendeClienteService/AtendeCliente')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/response-cep-05010000-found.xml')
        )

      const viaCepMock = nock('https://viacep.com.br')
        .get('/ws/05010000/json/')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/viacep-cep-05010000-found.json')
        )

      const wideNetMock = nock('https://cep.widenet.host')
        .get('/busca-cep/api/cep/05010000.json')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/widenet-cep-05010000-found.json')
        )

      return cep('05010000', ['correios'])
        .then(address => {
          expect(address).to.deep.equal({
            cep: '05010000',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Perdizes',
            street: 'Rua Caiubi'
          })

          expect(correiosMock.isDone()).to.be.equal(true)
          expect(viaCepMock.isDone()).to.be.equal(false)
          expect(wideNetMock.isDone()).to.be.equal(false)
      })
    })
  })

  describe('and the providers param is [\'correios, viacep\']', () => {
    it('should call only correios and viacep services', () => {
      const correiosMock = nock('https://apps.correios.com.br')
        .post('/SigepMasterJPA/AtendeClienteService/AtendeCliente')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/response-cep-05010000-found.xml')
        )

      const viaCepMock = nock('https://viacep.com.br')
        .get('/ws/05010000/json/')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/viacep-cep-05010000-found.json')
        )

      const wideNetMock = nock('https://cep.widenet.host')
        .get('/busca-cep/api/cep/05010000.json')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/widenet-cep-05010000-found.json')
        )

      return cep('05010000', ['correios', 'viacep'])
        .then(address => {
          expect(address).to.deep.equal({
            cep: '05010000',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Perdizes',
            street: 'Rua Caiubi'
          })

          expect(viaCepMock.isDone()).to.be.equal(true)
          expect(correiosMock.isDone()).to.be.equal(true)
          expect(wideNetMock.isDone()).to.be.equal(false)
      })
    })
  })

  describe('and the providers param is []', () => {
    it('should call all services', () => {
      const correiosMock = nock('https://apps.correios.com.br')
        .post('/SigepMasterJPA/AtendeClienteService/AtendeCliente')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/response-cep-05010000-found.xml')
        )

      const viaCepMock = nock('https://viacep.com.br')
        .get('/ws/05010000/json/')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/viacep-cep-05010000-found.json')
        )

      const wideNetMock = nock('https://cep.widenet.host')
        .get('/busca-cep/api/cep/05010000.json')
        .replyWithFile(
          200,
          path.join(__dirname, '/fixtures/widenet-cep-05010000-found.json')
        )

      return cep('05010000', [])
        .then(address => {
          expect(address).to.deep.equal({
            cep: '05010000',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Perdizes',
            street: 'Rua Caiubi'
          })

          expect(viaCepMock.isDone()).to.be.equal(true)
          expect(correiosMock.isDone()).to.be.equal(true)
          expect(wideNetMock.isDone()).to.be.equal(true)
      })
    })
  })

  afterEach(() => {
    nock.cleanAll()
  })
})
