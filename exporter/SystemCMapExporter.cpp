#include "SystemCMapExporter.hpp"

#include <fstream>
#include <ostream>
#include <stdexcept>
#include <string>
#include <systemc>
#include <vector>

namespace class_maps {
namespace {

std::string escape_json(const std::string& value)
{
    std::string escaped;
    escaped.reserve(value.size());

    for (const char character : value) {
        switch (character) {
        case '\\':
            escaped += "\\\\";
            break;
        case '"':
            escaped += "\\\"";
            break;
        case '\b':
            escaped += "\\b";
            break;
        case '\f':
            escaped += "\\f";
            break;
        case '\n':
            escaped += "\\n";
            break;
        case '\r':
            escaped += "\\r";
            break;
        case '\t':
            escaped += "\\t";
            break;
        default:
            escaped += character;
            break;
        }
    }

    return escaped;
}

std::string local_name(const std::string& hierarchical_name)
{
    const std::size_t separator = hierarchical_name.find_last_of('.');
    if (separator == std::string::npos) {
        return hierarchical_name;
    }
    return hierarchical_name.substr(separator + 1);
}

void write_module(
    std::ostream& output,
    const sc_core::sc_object* object,
    const std::string& parent_module_id,
    bool& first_node)
{
    const auto* module = dynamic_cast<const sc_core::sc_module*>(object);
    std::string next_parent_id = parent_module_id;

    if (module != nullptr) {
        const std::string id = object->name();
        const std::string name = local_name(id);

        if (!first_node) {
            output << ",\n";
        }
        first_node = false;

        output << "    {\n"
               << "      \"id\": \"" << escape_json(id) << "\",\n"
               << "      \"name\": \"" << escape_json(name) << "\",\n"
               << "      \"kind\": \"" << escape_json(object->kind()) << "\",\n"
               << "      \"parentId\": ";

        if (parent_module_id.empty()) {
            output << "null\n";
        } else {
            output << "\"" << escape_json(parent_module_id) << "\"\n";
        }

        output << "    }";
        next_parent_id = id;
    }

    for (const sc_core::sc_object* child : object->get_child_objects()) {
        write_module(output, child, next_parent_id, first_node);
    }
}

} // namespace

void write_systemc_map(std::ostream& output)
{
    output << "{\n  \"nodes\": [\n";

    bool first_node = true;
    const std::vector<sc_core::sc_object*>& top_level_objects =
        sc_core::sc_get_top_level_objects();

    for (const sc_core::sc_object* object : top_level_objects) {
        write_module(output, object, "", first_node);
    }

    output << "\n  ],\n  \"edges\": []\n}\n";
}

void write_systemc_map(const std::string& path)
{
    std::ofstream output(path);
    if (!output.is_open()) {
        throw std::runtime_error("Unable to open SystemC map output file: " + path);
    }

    write_systemc_map(output);
}

} // namespace class_maps
