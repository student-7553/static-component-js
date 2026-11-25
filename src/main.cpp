#include <iostream>
#include <string>
#include <classes/FileLoader/FileLoader.hpp>
#include <classes/Component/Component.hpp>

using namespace std;

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        cerr << "Usage: " << argv[0] << " <component_folder>" << endl;
        return 1;
    }

    string componentFolder = argv[1];

    cout << "Component folder: " << componentFolder << endl;

    FileLoader *fileLoad = new FileLoader(componentFolder);
    fileLoad->init();

    vector<ComponentFile> *files = fileLoad->getFiles();
    for (const ComponentFile &file : *files)
    {
        Component *component = new Component();
        component->init(file);
    }

    // get all the html files, load them up

    return 0;
}