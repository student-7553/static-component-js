
#include "filesystem"
#include "fstream"
#include "stdexcept"
#include <iostream>

#include "./Component.hpp"
#include "../FileLoader/FileLoader.hpp"
#include "Node.hpp"

using namespace std;

string readFile(const string &filePath)
{
  std::ifstream f(filePath, ios::binary);
  if (!f)
  {
    runtime_error("cannot open file " + filePath);
  }

  auto size = filesystem::file_size(filePath);
  string fileString(size, '\0');
  f.read(fileString.data(), static_cast<streamsize>(size));
  fileString.resize(f.gcount());
  return fileString;
}

Node parseStringToNode(string fileStringContent)
{

}

Component::Component() {}

void Component::init(const ComponentFile file)
{

  string fileStringContent = readFile(file.filePath);
  Node parsedNode = parseStringToNode(fileStringContent);
  this->rootNode = parsedNode;

  return;
}
