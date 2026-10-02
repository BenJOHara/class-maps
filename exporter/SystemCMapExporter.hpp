#pragma once

#include <iosfwd>
#include <string>

namespace class_maps {

void write_systemc_map(std::ostream& output);
void write_systemc_map(const std::string& path);

} // namespace class_maps
