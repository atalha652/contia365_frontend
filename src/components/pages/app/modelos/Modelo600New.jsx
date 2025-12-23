// Modelo 600 - New Structure based on updated JSON specification
import React, { useState } from "react";
import { ArrowLeft, Save, FileText, User, Building, Calculator, CreditCard, Home, FileCheck, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input, Select } from "../../../ui";
import Modelo600NewExtended from "./Modelo600NewExtended";

const Modelo600New = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/app/modelos";

  // Complete form state based on the new JSON structure
  const [formData, setFormData] = useState({
    header: {
      delegacion: "",
      administracion: "",
      codigo_administracion: "",
      modelo: "600",
      etiqueta_identificativa: ""
    },
    sujeto_pasivo: {
      nif_dni: "",
      nombre_razon_social: "",
      direccion: {
        via: "",
        numero: "",
        escalera: "",
        piso: "",
        puerta: ""
      },
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: "",
      etiqueta_identificativa: ""
    },
    transmitente: {
      nif_dni: "",
      nombre_razon_social: "",
      direccion: {
        via: "",
        numero: "",
        escalera: "",
        piso: "",
        puerta: ""
      },
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: "",
      etiqueta_identificativa: ""
    },
    operacion: {
      clave_concepto: "",
      devengo: {
        dia: "",
        mes: "",
        anio: ""
      },
      numero_sujetos_pasivos: "",
      numero_transmitentes: ""
    },
    datos_documento: {
      tipo_documento: {
        administrativo: false,
        judicial: false,
        mercantil: false,
        notarial: false,
        privado: false
      },
      identificacion_notario_autoridad: "",
      localidad_otorgamiento: "",
      numero_protocolo: ""
    },
    datos_bien: {
      concepto: "",
      tipo_bien: {
        urbano: false,
        rustico: false
      },
      referencia_catastral: "",
      otros_datos_identificativos: "",
      via_publica_paraje: "",
      numero: "",
      escalera: "",
      piso: "",
      puerta: "",
      municipio: "",
      provincia: "",
      codigo_postal: "",
      superficie: "",
      valor_catastral: "",
      valor_declarado: ""
    },
    autoliquidacion: {
      valor: "",
      exento: false,
      no_sujeto: false,
      fundamento_beneficio_fiscal_o_no_sujecion: "",
      liquidacion_complementaria: false,
      datos_primera_liquidacion: {
        numero: "",
        fecha_presentacion: "",
        importe_ingresado: ""
      },
      base_imponible: "",
      reduccion: "",
      base_liquidable: "",
      tipo_impositivo: "",
      cuota: "",
      bonificacion_cuota: "",
      importe_a_ingresar: "",
      total_a_ingresar: ""
    },
    presentador: {
      nif_dni: "",
      nombre_apellidos: "",
      direccion: {
        via: "",
        numero: "",
        escalera: "",
        piso: "",
        puerta: ""
      },
      municipio: "",
      provincia: "",
      codigo_postal: "",
      telefono: "",
      fax: "",
      etiqueta_identificativa: ""
    },
    firma: {
      lugar: "",
      dia: "",
      mes: "",
      anio: "",
      firma_sujeto_pasivo_o_presentador: ""
    },
    ingreso: {
      importe: "",
      forma_pago: {
        efectivo: false,
        adeudo_en_cuenta: false
      },
      cuenta_bancaria: {
        entidad: "",
        sucursal: "",
        dc: "",
        numero_cuenta: ""
      }
    },
    anexo: {
      sujetos_pasivos: [],
      transmitentes: []
    }
  });

  // Helper functions for nested updates
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleCheckboxChange = (section, subsection, field, checked) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: checked
        }
      }
    }));
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                 variant="secondary" 
                 size="icon"
                 onClick={() => navigate(returnTo)}
               >
                 <ArrowLeft className="w-4 h-4" />
               </Button>
              <div>
                <h1 className="text-2xl font-semibold text-fg-40">Modelo 600</h1>
                <p className="text-sm text-fg-60 mt-1">
                  Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button variant="primary">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
        {/* Form Content */}
        <div className="py-4 space-y-6">
          {/* Header Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Datos del Formulario</h2>
                <p className="text-sm text-fg-60">Información general del modelo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Delegación
                </label>
                <Input
                  type="text"
                  value={formData.header.delegacion}
                  onChange={(e) => handleInputChange('header', 'delegacion', e.target.value)}
                  placeholder="Delegación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Administración
                </label>
                <Input
                  type="text"
                  value={formData.header.administracion}
                  onChange={(e) => handleInputChange('header', 'administracion', e.target.value)}
                  placeholder="Administración"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Administración
                </label>
                <Input
                  type="text"
                  value={formData.header.codigo_administracion}
                  onChange={(e) => handleInputChange('header', 'codigo_administracion', e.target.value)}
                  placeholder="Código"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Etiqueta Identificativa
                </label>
                <Input
                  type="text"
                  value={formData.header.etiqueta_identificativa}
                  onChange={(e) => handleInputChange('header', 'etiqueta_identificativa', e.target.value)}
                  placeholder="Etiqueta"
                />
              </div>
            </div>
          </div>

          {/* Sujeto Pasivo Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Sujeto Pasivo</h2>
                <p className="text-sm text-fg-60">Datos del contribuyente</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  NIF/DNI *
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.nif_dni}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'nif_dni', e.target.value)}
                  placeholder="12345678A"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Nombre/Razón Social *
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.nombre_razon_social}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'nombre_razon_social', e.target.value)}
                  placeholder="Nombre completo o razón social"
                  required
                />
              </div>
              
              {/* Dirección del Sujeto Pasivo */}
              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold text-fg-50 mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-fg-60 mb-1">Vía</label>
                    <Input
                      type="text"
                      value={formData.sujeto_pasivo.direccion.via}
                      onChange={(e) => handleNestedInputChange('sujeto_pasivo', 'direccion', 'via', e.target.value)}
                      placeholder="Calle, Plaza, Avenida..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Número</label>
                    <Input
                      type="text"
                      value={formData.sujeto_pasivo.direccion.numero}
                      onChange={(e) => handleNestedInputChange('sujeto_pasivo', 'direccion', 'numero', e.target.value)}
                      placeholder="Nº"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Escalera</label>
                    <Input
                      type="text"
                      value={formData.sujeto_pasivo.direccion.escalera}
                      onChange={(e) => handleNestedInputChange('sujeto_pasivo', 'direccion', 'escalera', e.target.value)}
                      placeholder="Esc"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Piso</label>
                    <Input
                      type="text"
                      value={formData.sujeto_pasivo.direccion.piso}
                      onChange={(e) => handleNestedInputChange('sujeto_pasivo', 'direccion', 'piso', e.target.value)}
                      placeholder="Piso"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Puerta</label>
                    <Input
                      type="text"
                      value={formData.sujeto_pasivo.direccion.puerta}
                      onChange={(e) => handleNestedInputChange('sujeto_pasivo', 'direccion', 'puerta', e.target.value)}
                      placeholder="Pta"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Municipio
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.municipio}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.provincia}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Postal
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.codigo_postal}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'codigo_postal', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.sujeto_pasivo.telefono}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'telefono', e.target.value)}
                  placeholder="600123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Etiqueta Identificativa
                </label>
                <Input
                  type="text"
                  value={formData.sujeto_pasivo.etiqueta_identificativa}
                  onChange={(e) => handleInputChange('sujeto_pasivo', 'etiqueta_identificativa', e.target.value)}
                  placeholder="Etiqueta"
                />
              </div>
            </div>
          </div>
          {/* Transmitente Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Transmitente</h2>
                <p className="text-sm text-fg-60">Datos del transmitente</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  NIF/DNI
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.nif_dni}
                  onChange={(e) => handleInputChange('transmitente', 'nif_dni', e.target.value)}
                  placeholder="12345678A"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Nombre/Razón Social
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.nombre_razon_social}
                  onChange={(e) => handleInputChange('transmitente', 'nombre_razon_social', e.target.value)}
                  placeholder="Nombre completo o razón social"
                />
              </div>
              
              {/* Dirección del Transmitente */}
              <div className="md:col-span-3">
                <h3 className="text-sm font-semibold text-fg-50 mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-fg-60 mb-1">Vía</label>
                    <Input
                      type="text"
                      value={formData.transmitente.direccion.via}
                      onChange={(e) => handleNestedInputChange('transmitente', 'direccion', 'via', e.target.value)}
                      placeholder="Calle, Plaza, Avenida..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Número</label>
                    <Input
                      type="text"
                      value={formData.transmitente.direccion.numero}
                      onChange={(e) => handleNestedInputChange('transmitente', 'direccion', 'numero', e.target.value)}
                      placeholder="Nº"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Escalera</label>
                    <Input
                      type="text"
                      value={formData.transmitente.direccion.escalera}
                      onChange={(e) => handleNestedInputChange('transmitente', 'direccion', 'escalera', e.target.value)}
                      placeholder="Esc"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Piso</label>
                    <Input
                      type="text"
                      value={formData.transmitente.direccion.piso}
                      onChange={(e) => handleNestedInputChange('transmitente', 'direccion', 'piso', e.target.value)}
                      placeholder="Piso"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-fg-60 mb-1">Puerta</label>
                    <Input
                      type="text"
                      value={formData.transmitente.direccion.puerta}
                      onChange={(e) => handleNestedInputChange('transmitente', 'direccion', 'puerta', e.target.value)}
                      placeholder="Pta"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Municipio
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.municipio}
                  onChange={(e) => handleInputChange('transmitente', 'municipio', e.target.value)}
                  placeholder="Municipio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Provincia
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.provincia}
                  onChange={(e) => handleInputChange('transmitente', 'provincia', e.target.value)}
                  placeholder="Provincia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Código Postal
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.codigo_postal}
                  onChange={(e) => handleInputChange('transmitente', 'codigo_postal', e.target.value)}
                  placeholder="28001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.transmitente.telefono}
                  onChange={(e) => handleInputChange('transmitente', 'telefono', e.target.value)}
                  placeholder="600123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Etiqueta Identificativa
                </label>
                <Input
                  type="text"
                  value={formData.transmitente.etiqueta_identificativa}
                  onChange={(e) => handleInputChange('transmitente', 'etiqueta_identificativa', e.target.value)}
                  placeholder="Etiqueta"
                />
              </div>
            </div>
          </div>

          {/* Operación Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Operación</h2>
                <p className="text-sm text-fg-60">Datos de la operación y devengo</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Clave Concepto
                </label>
                <Select
                  value={formData.operacion.clave_concepto}
                  onChange={(e) => handleInputChange('operacion', 'clave_concepto', e.target.value)}
                >
                  <option value="">Seleccionar concepto</option>
                  <option value="01">01 - Transmisiones onerosas de bienes inmuebles</option>
                  <option value="02">02 - Transmisiones onerosas de bienes muebles</option>
                  <option value="03">03 - Constitución de derechos reales</option>
                  <option value="04">04 - Arrendamientos de bienes inmuebles</option>
                </Select>
              </div>
              
              {/* Devengo */}
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Día
                </label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.operacion.devengo.dia}
                  onChange={(e) => handleNestedInputChange('operacion', 'devengo', 'dia', e.target.value)}
                  placeholder="DD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Mes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.operacion.devengo.mes}
                  onChange={(e) => handleNestedInputChange('operacion', 'devengo', 'mes', e.target.value)}
                  placeholder="MM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Devengo - Año
                </label>
                <Input
                  type="number"
                  min="2000"
                  max="2030"
                  value={formData.operacion.devengo.anio}
                  onChange={(e) => handleNestedInputChange('operacion', 'devengo', 'anio', e.target.value)}
                  placeholder="YYYY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número Sujetos Pasivos
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.operacion.numero_sujetos_pasivos}
                  onChange={(e) => handleInputChange('operacion', 'numero_sujetos_pasivos', e.target.value)}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número Transmitentes
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.operacion.numero_transmitentes}
                  onChange={(e) => handleInputChange('operacion', 'numero_transmitentes', e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
          </div>
          {/* Datos del Documento Section */}
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg-40">Datos del Documento</h2>
                <p className="text-sm text-fg-60">Información sobre el documento que origina la transmisión</p>
              </div>
            </div>
            
            {/* Tipo de Documento - Checkboxes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-fg-50 mb-3">Tipo de Documento</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.datos_documento.tipo_documento.administrativo}
                    onChange={(e) => handleCheckboxChange('datos_documento', 'tipo_documento', 'administrativo', e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                  />
                  <span className="text-sm text-fg-50">Administrativo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.datos_documento.tipo_documento.judicial}
                    onChange={(e) => handleCheckboxChange('datos_documento', 'tipo_documento', 'judicial', e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                  />
                  <span className="text-sm text-fg-50">Judicial</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.datos_documento.tipo_documento.mercantil}
                    onChange={(e) => handleCheckboxChange('datos_documento', 'tipo_documento', 'mercantil', e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                  />
                  <span className="text-sm text-fg-50">Mercantil</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.datos_documento.tipo_documento.notarial}
                    onChange={(e) => handleCheckboxChange('datos_documento', 'tipo_documento', 'notarial', e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                  />
                  <span className="text-sm text-fg-50">Notarial</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.datos_documento.tipo_documento.privado}
                    onChange={(e) => handleCheckboxChange('datos_documento', 'tipo_documento', 'privado', e.target.checked)}
                    className="form-checkbox h-4 w-4 rounded border-bd-50"
                  />
                  <span className="text-sm text-fg-50">Privado</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Identificación Notario/Autoridad
                </label>
                <Input
                  type="text"
                  value={formData.datos_documento.identificacion_notario_autoridad}
                  onChange={(e) => handleInputChange('datos_documento', 'identificacion_notario_autoridad', e.target.value)}
                  placeholder="Nombre del notario o autoridad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Localidad Otorgamiento
                </label>
                <Input
                  type="text"
                  value={formData.datos_documento.localidad_otorgamiento}
                  onChange={(e) => handleInputChange('datos_documento', 'localidad_otorgamiento', e.target.value)}
                  placeholder="Localidad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-50 mb-2">
                  Número de Protocolo
                </label>
                <Input
                  type="text"
                  value={formData.datos_documento.numero_protocolo}
                  onChange={(e) => handleInputChange('datos_documento', 'numero_protocolo', e.target.value)}
                  placeholder="Número de protocolo"
                />
              </div>
            </div>
          </div>

          {/* Extended Sections */}
          <Modelo600NewExtended formData={formData} setFormData={setFormData} />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-bd-50">
            <Button 
              variant="secondary"
              onClick={() => navigate(returnTo)}
            >
              Cancelar
            </Button>
            <Button variant="primary">
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button variant="primary" className="bg-green-600 hover:bg-green-700">
              <FileText className="w-4 h-4 mr-2" />
              Generar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modelo600New;