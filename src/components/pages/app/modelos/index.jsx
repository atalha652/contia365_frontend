// Modelos page - Shows available Spanish tax forms
import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, Building2 } from "lucide-react";

const Modelos = () => {
  const navigate = useNavigate();

  // Available tax forms
  const forms = [
    {
      id: "modelo-600",
      name: "Modelo 600",
      fullName: "Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
      version: "Ver. 3.0.2008",
      description: "Formulario para el pago del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados",
      category: "Transmisiones Patrimoniales",
      icon: Building2,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    }
  ];

  const handleFormClick = (formId) => {
    navigate(`/app/modelos/${formId}`);
  };

  return (
    <div className="flex-1 bg-bg-70">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-fg-40">Modelos</h1>
              <p className="text-sm text-fg-60 mt-1">Formularios fiscales españoles disponibles</p>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => {
              const IconComponent = form.icon;
              return (
                <div
                  key={form.id}
                  className="bg-bg-50 border border-bd-50 rounded-xl p-6 hover:border-bd-40 transition-colors cursor-pointer"
                  onClick={() => handleFormClick(form.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${form.color}`}>
                      <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {form.version}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-fg-40">{form.name}</h3>
                    <p className="text-sm font-medium text-fg-50">{form.fullName}</p>
                    <p className="text-sm text-fg-60 line-clamp-2">{form.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-bd-50">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {form.category}
                      </span>
                      <div className="flex items-center text-xs text-fg-60">
                        <FileText className="w-3 h-3 mr-1" />
                        Formulario
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State for Future Forms */}
        <div className="py-8">
          <div className="bg-bg-50 border border-bd-50 rounded-xl p-8 text-center">
            <Calendar className="w-12 h-12 text-fg-60 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-fg-40 mb-2">Más formularios próximamente</h3>
            <p className="text-sm text-fg-60">
              Estamos trabajando para añadir más modelos fiscales españoles a la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modelos;